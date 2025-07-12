(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))t(s);new MutationObserver(s=>{for(const r of s)if(r.type==="childList")for(const i of r.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&t(i)}).observe(document,{childList:!0,subtree:!0});function n(s){const r={};return s.integrity&&(r.integrity=s.integrity),s.referrerPolicy&&(r.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?r.credentials="include":s.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function t(s){if(s.ep)return;s.ep=!0;const r=n(s);fetch(s.href,r)}})();const l="https://url.radhi.tech";async function d(o){const e=await fetch(`${l}/shorten`,{method:"POST",headers:{"Content-Type":"text/plain"},body:o});if(!e.ok){const s=await e.text();throw new Error(s||`HTTP error! status: ${e.status}`)}const n=await e.text(),t=n.split("/").pop()||"";return{shortUrl:n,originalUrl:o,key:t}}async function a(o){const e=await fetch(`${l}/check`,{method:"POST",headers:{"Content-Type":"text/plain"},body:o});if(!e.ok){const t=await e.text();throw new Error(t||`HTTP error! status: ${e.status}`)}return{origin:await e.text(),error:""}}async function c(){try{return(await fetch(`${l}/health`)).ok}catch{return!1}}function u(){return`
    <div class="bg-zinc-900 rounded-2xl p-8 shadow-2xl border border-zinc-800 my-8 fade-in">
      <h2 class="text-xl font-bold text-white mb-4 flex items-center">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
              class="flex-1 px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"/>
            <button
              id="analyzeBtn"
              class="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors shadow-lg">
              Analyze
            </button>
          </div>
        </div>

        <div id="analysisResults" class="hidden mt-4 p-4 bg-zinc-800 rounded-lg border border-zinc-700">
          <div id="analysisContent"></div>
        </div>

        <div id="analysisLoading" class="hidden text-center py-4">
          <div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
          <p class="text-zinc-300 mt-2 text-sm">Analyzing URL...</p>
        </div>
      </div>
    </div>
  `}function h(){return`
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
              required/>
            <div class="absolute inset-y-0 right-0 flex items-center pr-3">
              <svg class="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
              </svg>
            </div>
          </div>
        </div>

        <button
          type="submit"
          id="shortenBtn"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg">
          <span class="flex items-center justify-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
            Shorten URL
          </span>
        </button>
      </form>

      <div id="loading" class="hidden text-center py-8">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <p class="text-zinc-300 mt-2">Creating your short URL...</p>
      </div>

      <div id="error" class="hidden mt-6 p-4 bg-red-950 border border-red-800 rounded-lg">
        <p class="text-red-300" id="errorMessage"></p>
      </div>
    </div>
  `}function p(){return`
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-2xl mx-auto">
        <div class="text-center mb-12">
          <h1 class="text-5xl font-bold text-white mb-4">
            URL Shortener
          </h1>
          <p class="text-zinc-400 text-lg">
            Transform your long URLs into short, shareable links
          </p>
          <div class="flex items-center justify-center mt-4">
            <div class="flex items-center space-x-2">
              <div id="healthStatus" class="w-3 h-3 rounded-full bg-zinc-700"></div>
              <span class="text-zinc-500 text-sm">API Status</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `}function m(){return`
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
              class="flex-1 px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none"/>
            <button
              id="copyBtn"
              class="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition-colors shadow-lg"
              title="Copy to clipboard">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
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
            class="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none"/>
        </div>
      </div>
      <button
        id="newUrlBtn"
        class="w-full mt-6 bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-3 px-6 rounded-lg transition-all border border-zinc-700">
        Shorten Another URL
      </button>
    </div>
  `}class y{app;constructor(){this.app=document.querySelector("#app"),this.render(),this.setupEventListeners(),this.checkHealth()}render(){this.app.innerHTML=`
      <div class="container mx-auto px-4 py-8">
        <div class="max-w-2xl mx-auto">
          ${p()}
          ${h()}
          ${m()}
          ${u()}
        </div>
      </div>
    `}setupEventListeners(){const e=document.getElementById("shortenForm"),n=document.getElementById("copyBtn"),t=document.getElementById("newUrlBtn"),s=document.getElementById("analyzeBtn");e.addEventListener("submit",this.handleSubmit.bind(this)),n.addEventListener("click",this.copyToClipboard.bind(this)),t.addEventListener("click",this.resetForm.bind(this)),s.addEventListener("click",this.analyzeUrl.bind(this))}async handleSubmit(e){e.preventDefault();const t=document.getElementById("urlInput").value.trim();if(t){this.showLoading(!0),this.hideError();try{const s=await d(t);this.showResults(s)}catch(s){this.showError(s instanceof Error?s.message:"Failed to shorten URL. Please check your connection and try again."),console.error("Error:",s)}finally{this.showLoading(!1)}}}async analyzeUrl(){const n=document.getElementById("analyzeInput").value.trim();if(n){this.showAnalysisLoading(!0),this.hideAnalysisResults();try{const t=await a(n);this.showAnalysisResults(t)}catch(t){this.showAnalysisResults({origin:"",error:t instanceof Error?t.message:"Failed to analyze URL"})}finally{this.showAnalysisLoading(!1)}}}showLoading(e){const n=document.getElementById("loading"),t=document.getElementById("shortenForm");e?(n.classList.remove("hidden"),t.classList.add("hidden")):(n.classList.add("hidden"),t.classList.remove("hidden"))}showError(e){const n=document.getElementById("error"),t=document.getElementById("errorMessage");t.textContent=e,n.classList.remove("hidden")}hideError(){document.getElementById("error").classList.add("hidden")}showResults(e){const n=document.getElementById("results"),t=document.getElementById("shortUrlResult"),s=document.getElementById("originalUrlResult");t.value=e.shortUrl,s.value=e.originalUrl,n.classList.remove("hidden"),n.scrollIntoView({behavior:"smooth"})}async copyToClipboard(){const e=document.getElementById("shortUrlResult"),n=document.getElementById("copyBtn");try{await navigator.clipboard.writeText(e.value),n.innerHTML=`
                <svg
                    class="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M5 13l4 4L19 7"
                    ></path>
                </svg>
            `,setTimeout(()=>{n.innerHTML=`
                    <svg
                        class="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        ></path>
                    </svg>
                `},2e3)}catch(t){console.error("Failed to copy: ",t)}}resetForm(){const e=document.getElementById("shortenForm"),n=document.getElementById("results"),t=document.getElementById("urlInput");e.reset(),n.classList.add("hidden"),t.focus(),this.hideError()}showAnalysisLoading(e){const n=document.getElementById("analysisLoading"),t=document.getElementById("analysisResults");e?(n.classList.remove("hidden"),t.classList.add("hidden")):n.classList.add("hidden")}hideAnalysisResults(){document.getElementById("analysisResults").classList.add("hidden")}showAnalysisResults(e){const n=document.getElementById("analysisResults"),t=document.getElementById("analysisContent");e.error?t.innerHTML=`<p class="text-red-300"><strong>Error:</strong> ${e.error}</p>`:t.innerHTML=`<p class="text-zinc-200"><strong>Origin:</strong> ${e.origin}</p>`,n.classList.remove("hidden")}async checkHealth(){const e=document.getElementById("healthStatus"),n=await c();e.className=n?"w-3 h-3 rounded-full bg-green-500":"w-3 h-3 rounded-full bg-red-500"}}new y;
