import './style.css'

interface ShortenResponse {
    shortUrl: string;
    originalUrl: string;
    key: string;
}

interface UrlAnalysis {
    url: string;
    domain: string;
    protocol: string;
    path: string;
    isValid: boolean;
    redirectCount?: number;
    finalUrl?: string;
    error?: string;
}

class URLShortener {
    private baseUrl = '/api';
    private app: HTMLElement;

    constructor() {
        this.app = document.querySelector<HTMLDivElement>('#app')!;
        this.render();
        this.setupEventListeners();
        this.checkHealth();
    }

    private render(): void {
        this.app.innerHTML = `
      <div class="container mx-auto px-4 py-8">
        <div class="max-w-2xl mx-auto">
          <!-- Header -->
          <div class="text-center mb-12">
            <h1 class="text-5xl font-bold text-white mb-4">
              URL Shortener
            </h1>
            <p class="text-zinc-400 text-lg">Transform your long URLs into short, shareable links</p>
            <div class="flex items-center justify-center mt-4">
              <div class="flex items-center space-x-2">
                <div id="healthStatus" class="w-3 h-3 rounded-full bg-zinc-700"></div>
                <span class="text-zinc-500 text-sm">API Status</span>
              </div>
            </div>
          </div>

          <!-- URL Analysis Section -->
          <div class="bg-zinc-900 rounded-2xl p-8 shadow-2xl border border-zinc-800 mb-8 fade-in">
            <h2 class="text-xl font-bold text-white mb-4 flex items-center">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              URL Analysis
            </h2>
            <div class="space-y-4">
              <div>
                <label for="analyzeInput" class="block text-zinc-200 font-medium mb-2">
                  Analyze URL Origin
                </label>
                <div class="flex space-x-2">
                  <input
                    type="url"
                    id="analyzeInput"
                    placeholder="https://example.com/suspicious-link"
                    class="flex-1 px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  />
                  <button
                    id="analyzeBtn"
                    class="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors shadow-lg"
                  >
                    Analyze
                  </button>
                </div>
              </div>
              
              <!-- Analysis Results -->
              <div id="analysisResults" class="hidden mt-4 p-4 bg-zinc-800 rounded-lg border border-zinc-700">
                <div id="analysisContent"></div>
              </div>
              
              <!-- Analysis Loading -->
              <div id="analysisLoading" class="hidden text-center py-4">
                <div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
                <p class="text-zinc-300 mt-2 text-sm">Analyzing URL...</p>
              </div>
            </div>
          </div>

          <!-- Main Form -->
          <div class="bg-zinc-900 rounded-2xl p-8 shadow-2xl border border-zinc-800 glow fade-in">
            <form id="shortenForm" class="space-y-6">
              <div>
                <label for="urlInput" class="block text-zinc-200 font-medium mb-2">
                  Enter your URL
                </label>
                <div class="relative">
                  <input
                    type="url"
                    id="urlInput"
                    placeholder="https://example.com/very-long-url"
                    class="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    required
                  />
                  <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg class="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
                    </svg>
                  </div>
                </div>
              </div>
              
              <button
                type="submit"
                id="shortenBtn"
                class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                <span class="flex items-center justify-center">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                  Shorten URL
                </span>
              </button>
            </form>

            <!-- Loading State -->
            <div id="loading" class="hidden text-center py-8">
              <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p class="text-zinc-300 mt-2">Creating your short URL...</p>
            </div>

            <!-- Error State -->
            <div id="error" class="hidden mt-6 p-4 bg-red-950 border border-red-800 rounded-lg">
              <p class="text-red-300" id="errorMessage"></p>
            </div>
          </div>

          <!-- Results -->
          <div id="results" class="hidden mt-8 bg-zinc-900 rounded-2xl p-8 shadow-2xl border border-zinc-800 fade-in">
            <h3 class="text-2xl font-bold text-white mb-6 text-center">Your Short URL is Ready! 🎉</h3>
            
            <div class="space-y-4">
              <div>
                <label class="block text-zinc-300 text-sm font-medium mb-2">Short URL</label>
                <div class="flex items-center space-x-2">
                  <input
                    type="text"
                    id="shortUrlResult"
                    readonly
                    class="flex-1 px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none"
                  />
                  <button
                    id="copyBtn"
                    class="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition-colors shadow-lg"
                    title="Copy to clipboard"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                    </svg>
                  </button>
                </div>
              </div>
              
              <div>
                <label class="block text-zinc-300 text-sm font-medium mb-2">Original URL</label>
                <input
                  type="text"
                  id="originalUrlResult"
                  readonly
                  class="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none"
                />
              </div>
            </div>

            <button
              id="newUrlBtn"
              class="w-full mt-6 bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-3 px-6 rounded-lg transition-all border border-zinc-700">
              Shorten Another URL
            </button>
          </div>

          <!-- Recent URLs -->
          <div id="recentUrls" class="mt-8 bg-zinc-900 rounded-2xl p-8 shadow-2xl border border-zinc-800">
            <h3 class="text-xl font-bold text-white mb-4">Recent URLs</h3>
            <div id="urlHistory" class="space-y-2">
              <p class="text-zinc-500 text-center py-4">No URLs shortened yet</p>
            </div>
          </div>
        </div>
      </div>
    `;
    }

    private setupEventListeners(): void {
        const form = document.getElementById('shortenForm') as HTMLFormElement;
        const copyBtn = document.getElementById('copyBtn') as HTMLButtonElement;
        const newUrlBtn = document.getElementById('newUrlBtn') as HTMLButtonElement;
        const analyzeBtn = document.getElementById('analyzeBtn') as HTMLButtonElement;

        form.addEventListener('submit', this.handleSubmit.bind(this));
        copyBtn.addEventListener('click', this.copyToClipboard.bind(this));
        newUrlBtn.addEventListener('click', this.resetForm.bind(this));
        analyzeBtn.addEventListener('click', this.analyzeUrl.bind(this));
    }

    private async handleSubmit(e: Event): Promise<void> {
        e.preventDefault();

        const urlInput = document.getElementById('urlInput') as HTMLInputElement;
        const url = urlInput.value.trim();

        if (!url) return;

        this.showLoading(true);
        this.hideError();

        try {
            const response = await fetch(`${this.baseUrl}/shorten`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain',
                },
                body: url  // Send plain text URL, not JSON
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || `HTTP error! status: ${response.status}`);
            }

            const shortUrl = await response.text();  // Response is plain text
            const data = {
                shortUrl: shortUrl,
                originalUrl: url,
                key: shortUrl.split('/').pop() || ''
            };

            this.showResults(data);
            this.addToHistory(data);

        } catch (error) {
            this.showError(error instanceof Error ? error.message : 'Failed to shorten URL. Please check your connection and try again.');
            console.error('Error:', error);
        } finally {
            this.showLoading(false);
        }
    }

    private async analyzeUrl(): Promise<void> {
        const analyzeInput = document.getElementById('analyzeInput') as HTMLInputElement;
        const url = analyzeInput.value.trim();

        if (!url) return;

        this.showAnalysisLoading(true);
        this.hideAnalysisResults();

        try {
            const analysis = await this.performUrlAnalysis(url);
            this.showAnalysisResults(analysis);
        } catch (error) {
            this.showAnalysisResults({
                url,
                domain: '',
                protocol: '',
                path: '',
                isValid: false,
                error: error instanceof Error ? error.message : 'Failed to analyze URL'
            });
        } finally {
            this.showAnalysisLoading(false);
        }
    }

    private async performUrlAnalysis(url: string): Promise<UrlAnalysis> {
        try {
            // Parse URL to extract components
            const urlObj = new URL(url);

            const analysis: UrlAnalysis = {
                url: url,
                domain: urlObj.hostname,
                protocol: urlObj.protocol,
                path: urlObj.pathname + urlObj.search,
                isValid: true
            };

            // Try to get headers without following redirects
            try {
                const response = await fetch(url, {
                    method: 'HEAD',
                    redirect: 'manual',
                    mode: 'no-cors'
                });

                // Check if it's a redirect
                if (response.type === 'opaqueredirect' || (response.status >= 300 && response.status < 400)) {
                    analysis.redirectCount = 1;
                    // Note: Due to CORS, we can't follow the redirect chain in the browser
                    analysis.finalUrl = 'Redirect detected (cannot follow due to browser security)';
                }
            } catch (fetchError) {
                // CORS error is expected for cross-origin requests
                // This doesn't mean the URL is invalid
            }

            return analysis;
        } catch (error) {
            throw new Error('Invalid URL format');
        }
    }

    private showLoading(show: boolean): void {
        const loading = document.getElementById('loading')!;
        const form = document.getElementById('shortenForm')!;

        if (show) {
            loading.classList.remove('hidden');
            form.classList.add('hidden');
        } else {
            loading.classList.add('hidden');
            form.classList.remove('hidden');
        }
    }

    private showError(message: string): void {
        const errorDiv = document.getElementById('error')!;
        const errorMessage = document.getElementById('errorMessage')!;

        errorMessage.textContent = message;
        errorDiv.classList.remove('hidden');
    }

    private hideError(): void {
        const errorDiv = document.getElementById('error')!;
        errorDiv.classList.add('hidden');
    }

    private showResults(data: ShortenResponse): void {
        const results = document.getElementById('results')!;
        const shortUrlResult = document.getElementById('shortUrlResult') as HTMLInputElement;
        const originalUrlResult = document.getElementById('originalUrlResult') as HTMLInputElement;

        shortUrlResult.value = data.shortUrl;
        originalUrlResult.value = data.originalUrl;

        results.classList.remove('hidden');
        results.scrollIntoView({ behavior: 'smooth' });
    }

    private async copyToClipboard(): Promise<void> {
        const shortUrlResult = document.getElementById('shortUrlResult') as HTMLInputElement;
        const copyBtn = document.getElementById('copyBtn')!;

        try {
            await navigator.clipboard.writeText(shortUrlResult.value);

            copyBtn.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
      `;

            setTimeout(() => {
                copyBtn.innerHTML = `
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
          </svg>
        `;
            }, 2000);

        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    }

    private resetForm(): void {
        const form = document.getElementById('shortenForm') as HTMLFormElement;
        const results = document.getElementById('results')!;
        const urlInput = document.getElementById('urlInput') as HTMLInputElement;

        form.reset();
        results.classList.add('hidden');
        urlInput.focus();
        this.hideError();
    }

    private addToHistory(data: ShortenResponse): void {
        const urlHistory = document.getElementById('urlHistory')!;

        if (urlHistory.querySelector('p')) {
            urlHistory.innerHTML = '';
        }

        const historyItem = document.createElement('div');
        historyItem.className = 'flex items-center justify-between p-3 bg-zinc-800 rounded-lg border border-zinc-700 fade-in';
        historyItem.innerHTML = `
      <div class="flex-1 min-w-0">
        <p class="text-blue-400 font-medium truncate">${data.shortUrl}</p>
        <p class="text-zinc-400 text-sm truncate">${data.originalUrl}</p>
      </div>
      <button onclick="window.open('${data.shortUrl}', '_blank')" class="ml-2 text-zinc-300 hover:text-blue-400 transition-colors">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
        </svg>
      </button>
    `;

        urlHistory.insertBefore(historyItem, urlHistory.firstChild);
    }

    private async checkHealth(): Promise<void> {
        const healthStatus = document.getElementById('healthStatus')!;

        try {
            const response = await fetch(`${this.baseUrl}/health`);
            if (response.ok) {
                healthStatus.className = 'w-3 h-3 rounded-full bg-green-500';
            } else {
                healthStatus.className = 'w-3 h-3 rounded-full bg-red-500';
            }
        } catch {
            healthStatus.className = 'w-3 h-3 rounded-full bg-red-500';
        }
    }
}

new URLShortener();