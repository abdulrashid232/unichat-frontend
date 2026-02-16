import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MarkdownModule } from 'ngx-markdown';

interface Question {
  question_text: string;
  options: { letter: string; text: string }[];
  correct_answer: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

@Component({
  selector: 'app-exams',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, MarkdownModule],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Exam Preparation</h1>
          <p class="mt-2 text-gray-600 dark:text-gray-400">Upload your study materials and let AI help you prepare.</p>
        </div>

        <!-- Session Init -->
        <div *ngIf="!sessionId" class="flex justify-center py-12">
           <button (click)="initSession()" class="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-lg shadow-lg flex items-center transition-transform transform hover:scale-105">
             <span *ngIf="loading" class="mr-2">
               <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                 <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                 <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
               </svg>
             </span>
             Start New Prep Session
           </button>
        </div>

        <div *ngIf="sessionId" class="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <!-- Sidebar / tabs for mobile -->
          <div class="lg:col-span-1 space-y-4">
             <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                <nav class="flex flex-col">
                  <button 
                    (click)="activeTab = 'upload'"
                    [class]="activeTab === 'upload' ? 'bg-primary/10 text-primary border-r-4 border-primary' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'"
                    class="px-6 py-4 text-left font-medium transition-colors flex items-center">
                    <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                    Upload Material
                  </button>
                  <button 
                    (click)="activeTab = 'quiz'"
                    [disabled]="!hasContent"
                    [class]="activeTab === 'quiz' ? 'bg-primary/10 text-primary border-r-4 border-primary' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed'"
                    class="px-6 py-4 text-left font-medium transition-colors flex items-center">
                    <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                    Quiz Me
                  </button>
                  <button 
                    (click)="activeTab = 'chat'"
                     [disabled]="!hasContent"
                    [class]="activeTab === 'chat' ? 'bg-primary/10 text-primary border-r-4 border-primary' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed'"
                    class="px-6 py-4 text-left font-medium transition-colors flex items-center">
                    <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                    Chat with AI
                  </button>
                </nav>
             </div>
             
             <div *ngIf="hasContent" class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
               <h3 class="font-semibold text-blue-800 dark:text-blue-300 mb-2">Study Session Active</h3>
               <p class="text-sm text-blue-600 dark:text-blue-400">Content uploaded and processed. You can now generate quizzes or chat with your document.</p>
             </div>
          </div>

          <!-- Main Content Area -->
          <div class="lg:col-span-3">
             
             <!-- Upload Tab -->
             <div *ngIf="activeTab === 'upload'" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 sm:p-10">
                <div class="text-center max-w-xl mx-auto">
                    <div class="mx-auto h-24 w-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
                        <svg class="h-10 w-10 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                    </div>
                    <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Upload Study Material</h2>
                    <p class="text-gray-500 dark:text-gray-400 mb-8">Support for PDF, TXT, PPTX and Images.</p>
                    
                    <div *ngIf="isUploading" class="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mb-4">
                      <div class="bg-primary h-2.5 rounded-full transition-all duration-300" [style.width]="'50%'"></div>
                      <p class="text-sm text-center mt-2 text-gray-500">Processing document...</p>
                    </div>

                    <label *ngIf="!isUploading" class="block">
                        <span class="sr-only">Choose file</span>
                        <input type="file" (change)="onFileSelected($event)" class="block w-full text-sm text-slate-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-full file:border-0
                          file:text-sm file:font-semibold
                          file:bg-primary file:text-white
                          hover:file:bg-primary-dark
                          cursor-pointer
                        "/>
                    </label>
                    <p *ngIf="uploadError" class="mt-4 text-red-500 text-sm">{{uploadError}}</p>
                </div>
             </div>

             <!-- Quiz Tab -->
             <div *ngIf="activeTab === 'quiz'" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 sm:p-10">
                <div *ngIf="!questions.length && !loadingQuestions" class="text-center py-10">
                    <svg class="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
                    <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Ready to test your knowledge?</h3>
                    <p class="text-gray-500 dark:text-gray-400 mb-6">Generate unique questions based on your uploaded material.</p>
                    <button (click)="generateQuestions()" class="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-colors">
                        Generate Questions
                    </button>
                </div>

                <div *ngIf="loadingQuestions" class="flex flex-col items-center justify-center py-20">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                    <p class="text-gray-600 dark:text-gray-300">Generating questions from your content...</p>
                </div>

                <div *ngIf="questions.length && !feedback" class="space-y-8">
                    <h2 class="text-2xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-4">Quiz Time</h2>
                    
                    <div *ngFor="let q of questions; let i = index" class="bg-gray-50 dark:bg-gray-700/30 p-6 rounded-lg">
                        <p class="text-lg font-medium text-gray-900 dark:text-white mb-4"><span class="text-primary font-bold mr-2">{{i+1}}.</span> {{q.question_text}}</p>
                        <div class="space-y-2 pl-6">
                            <div *ngFor="let opt of q.options" class="flex items-center">
                                <input type="radio" [name]="'q'+i" [id]="'q'+i+opt.letter" [value]="opt.letter" (change)="selectAnswer(i, opt.letter)" class="text-primary focus:ring-primary h-4 w-4 border-gray-300">
                                <label [for]="'q'+i+opt.letter" class="ml-3 block text-gray-700 dark:text-gray-300 cursor-pointer">
                                    <span class="font-bold mr-2">{{opt.letter}}.</span> {{opt.text}}
                                </label>
                            </div>
                        </div>
                    </div>

                    <div class="flex justify-end pt-4">
                        <button (click)="submitQuiz()" class="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-colors">
                            Submit Answers
                        </button>
                    </div>
                </div>

                <div *ngIf="feedback" class="space-y-8">
                     <div class="text-center py-6 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800">
                         <h2 class="text-3xl font-bold text-green-800 dark:text-green-300 mb-2">Score: {{feedback.score | number:'1.0-0'}}%</h2>
                         <p class="text-green-700 dark:text-green-400">You got {{feedback.correct_answers}} out of {{feedback.total_questions}} correct!</p>
                     </div>

                     <div class="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                         <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">Feedback</h3>
                         <markdown [data]="feedback.personalized_feedback" class="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300"></markdown>
                     </div>

                     <button (click)="resetQuiz()" class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">
                         Take Another Quiz
                     </button>
                </div>
             </div>

             <!-- Chat Tab -->
             <div *ngIf="activeTab === 'chat'" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm flex flex-col h-[600px]">
                <div class="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-t-xl">
                   <h3 class="font-bold text-gray-900 dark:text-white">Chat with your Document</h3>
                   <p class="text-xs text-gray-500">Ask specific questions or request summaries.</p>
                </div>
                
                <div class="flex-1 overflow-y-auto p-4 space-y-4" #chatScroll>
                    <div *ngIf="chatMessages.length === 0" class="text-center py-20 text-gray-400">
                        <p>No messages yet. Start asking questions!</p>
                    </div>
                    
                    <div *ngFor="let msg of chatMessages" class="flex" [ngClass]="msg.role === 'user' ? 'justify-end' : 'justify-start'">
                        <div class="max-w-[85%] rounded-2xl px-4 py-3 shadow-sm"
                             [ngClass]="msg.role === 'user' ? 'bg-primary text-white rounded-br-none' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'">
                             <markdown [data]="msg.content"></markdown>
                        </div>
                    </div>
                    
                    <div *ngIf="isChatting" class="flex justify-start">
                         <div class="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-3 rounded-bl-none">
                            <div class="flex space-x-2">
                                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
                            </div>
                         </div>
                    </div>
                </div>
                
                <div class="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-xl">
                    <form (submit)="sendMessage()" class="flex space-x-2">
                        <input [(ngModel)]="currentMessage" name="message" type="text" placeholder="Type your question..." class="flex-1 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary" [disabled]="isChatting">
                        <button type="submit" [disabled]="!currentMessage.trim() || isChatting" class="bg-primary hover:bg-primary-dark disabled:opacity-50 text-white p-3 rounded-lg transition-colors">
                            <svg class="w-5 h-5 transform rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 16.571V11a1 1 0 112 0v5.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path></svg>
                        </button>
                    </form>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host ::ng-deep p { margin-bottom: 0.5rem; }
    :host ::ng-deep ul { list-style-type: disc; margin-left: 1.5rem; margin-bottom: 0.5rem; }
  `]
})
export class ExamsComponent implements OnInit {
  apiUrl = 'http://localhost:8000'; // FastAPI endpoint
  sessionId: string | null = null;
  activeTab: 'upload' | 'quiz' | 'chat' = 'upload';
  
  // States
  loading = false;
  isUploading = false;
  uploadError: string | null = null;
  hasContent = false;
  
  loadingQuestions = false;
  questions: Question[] = [];
  userAnswers: {[key: string]: string} = {}; // question_id -> letter
  feedback: any = null;
  
  isChatting = false;
  currentMessage = '';
  chatMessages: ChatMessage[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    // Optionally restore session from local storage
    const savedSession = localStorage.getItem('examSessionId');
    if (savedSession) {
      this.sessionId = savedSession;
      // We assume content exists if we have a session, ideally we'd check with backend
      this.hasContent = true; // Optimistic for now, or check local storage flag
    }
  }

  initSession() {
    this.loading = true;
    this.http.post<{session_id: string}>(`${this.apiUrl}/sessions`, {}).subscribe({
      next: (res) => {
        this.sessionId = res.session_id;
        localStorage.setItem('examSessionId', this.sessionId);
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file || !this.sessionId) return;

    this.isUploading = true;
    this.uploadError = null;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('session_id', this.sessionId);

    this.http.post(`${this.apiUrl}/upload`, formData).subscribe({
      next: () => {
        this.isUploading = false;
        this.hasContent = true;
        this.activeTab = 'quiz'; // Switch to quiz tab to prompt action
      },
      error: (err) => {
        console.error(err);
        this.isUploading = false;
        this.uploadError = "Failed to upload file. Please try again.";
      }
    });
  }

  generateQuestions() {
    if (!this.sessionId) return;
    this.loadingQuestions = true;

    this.http.post<{questions: any[]}>(`${this.apiUrl}/questions`, {session_id: this.sessionId}).subscribe({
      next: (res) => {
        this.questions = res.questions;
        this.loadingQuestions = false;
        this.feedback = null;
        this.userAnswers = {};
      },
      error: (err) => {
        console.error(err);
        this.loadingQuestions = false;
      }
    });
  }

  selectAnswer(questionIndex: number, letter: string) {
    this.userAnswers[`q_${questionIndex}`] = letter;
  }

  submitQuiz() {
    if (!this.sessionId) return;
    
    this.http.post<any>(`${this.apiUrl}/evaluate`, {
        session_id: this.sessionId,
        answers: this.userAnswers
    }).subscribe({
        next: (res) => {
            this.feedback = res;
        },
        error: (err) => console.error(err)
    });
  }

  resetQuiz() {
      this.feedback = null;
      this.userAnswers = {};
      this.questions = []; // Optional: clear questions to force regeneration or just reset answers
      this.generateQuestions(); // Regenerate for new experience? Or just reset. Let's regenerate.
  }

  sendMessage() {
      if (!this.currentMessage.trim() || !this.sessionId) return;
      
      const userMsg = this.currentMessage;
      this.chatMessages.push({ role: 'user', content: userMsg });
      this.currentMessage = '';
      this.isChatting = true;
      
      this.http.post<{answer: string}>(`${this.apiUrl}/chat`, {
          session_id: this.sessionId,
          message: userMsg
      }).subscribe({
          next: (res) => {
              this.chatMessages.push({ role: 'assistant', content: res.answer });
              this.isChatting = false;
          },
          error: (err) => {
              console.error(err);
              this.chatMessages.push({ role: 'assistant', content: "Sorry, I encountered an error answering that." });
              this.isChatting = false;
          }
      });
  }
}
