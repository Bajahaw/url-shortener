(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))s(e);new MutationObserver(e=>{for(const n of e)if(n.type==="childList")for(const o of n.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&s(o)}).observe(document,{childList:!0,subtree:!0});function r(e){const n={};return e.integrity&&(n.integrity=e.integrity),e.referrerPolicy&&(n.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?n.credentials="include":e.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function s(e){if(e.ep)return;e.ep=!0;const n=r(e);fetch(e.href,n)}})();class d{baseUrl="https://url.radhi.tech";app;constructor(){this.app=document.querySelector("#app"),this.render(),this.setupEventListeners(),this.checkHealth()}render(){this.app.innerHTML=`
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
    `}setupEventListeners(){const t=document.getElementById("shortenForm"),r=document.getElementById("copyBtn"),s=document.getElementById("newUrlBtn"),e=document.getElementById("analyzeBtn");t.addEventListener("submit",this.handleSubmit.bind(this)),r.addEventListener("click",this.copyToClipboard.bind(this)),s.addEventListener("click",this.resetForm.bind(this)),e.addEventListener("click",this.analyzeUrl.bind(this))}async handleSubmit(t){t.preventDefault();const s=document.getElementById("urlInput").value.trim();if(s){this.showLoading(!0),this.hideError();try{const e=await fetch(`${this.baseUrl}/shorten`,{method:"POST",headers:{"Content-Type":"text/plain"},body:s});if(!e.ok){const l=await e.text();throw new Error(l||`HTTP error! status: ${e.status}`)}const n=await e.text(),o={shortUrl:n,originalUrl:s,key:n.split("/").pop()||""};this.showResults(o),this.addToHistory(o)}catch(e){this.showError(e instanceof Error?e.message:"Failed to shorten URL. Please check your connection and try again."),console.error("Error:",e)}finally{this.showLoading(!1)}}}async analyzeUrl(){}showLoading(t){const r=document.getElementById("loading"),s=document.getElementById("shortenForm");t?(r.classList.remove("hidden"),s.classList.add("hidden")):(r.classList.add("hidden"),s.classList.remove("hidden"))}showError(t){const r=document.getElementById("error"),s=document.getElementById("errorMessage");s.textContent=t,r.classList.remove("hidden")}hideError(){document.getElementById("error").classList.add("hidden")}showResults(t){const r=document.getElementById("results"),s=document.getElementById("shortUrlResult"),e=document.getElementById("originalUrlResult");s.value=t.shortUrl,e.value=t.originalUrl,r.classList.remove("hidden"),r.scrollIntoView({behavior:"smooth"})}async copyToClipboard(){const t=document.getElementById("shortUrlResult"),r=document.getElementById("copyBtn");try{await navigator.clipboard.writeText(t.value),r.innerHTML=`
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
      `,setTimeout(()=>{r.innerHTML=`
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
          </svg>
        `},2e3)}catch(s){console.error("Failed to copy: ",s)}}resetForm(){const t=document.getElementById("shortenForm"),r=document.getElementById("results"),s=document.getElementById("urlInput");t.reset(),r.classList.add("hidden"),s.focus(),this.hideError()}addToHistory(t){const r=document.getElementById("urlHistory");r.querySelector("p")&&(r.innerHTML="");const s=document.createElement("div");s.className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg border border-zinc-700 fade-in",s.innerHTML=`
      <div class="flex-1 min-w-0">
        <p class="text-blue-400 font-medium truncate">${t.shortUrl}</p>
        <p class="text-zinc-400 text-sm truncate">${t.originalUrl}</p>
      </div>
      <button onclick="window.open('${t.shortUrl}', '_blank')" class="ml-2 text-zinc-300 hover:text-blue-400 transition-colors">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
        </svg>
      </button>
    `,r.insertBefore(s,r.firstChild)}async checkHealth(){const t=document.getElementById("healthStatus");try{(await fetch(`${this.baseUrl}/health`)).ok?t.className="w-3 h-3 rounded-full bg-green-500":t.className="w-3 h-3 rounded-full bg-red-500"}catch{t.className="w-3 h-3 rounded-full bg-red-500"}}}new d;
