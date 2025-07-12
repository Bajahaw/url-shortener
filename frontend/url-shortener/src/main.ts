import "./style.css";
import type {UrlAnalysis, ShortenResponse} from "./types";
import {
    shortenUrl,
    analyzeUrlOrigin,
    checkApiHealth,
} from "./services/urlService";
import {
    renderHeader,
    renderAnalysisSection,
    renderFormSection,
    renderResultsSection,
} from "./components.ts"

class URLShortener {
    private app: HTMLElement;

    constructor() {
        this.app = document.querySelector<HTMLDivElement>("#app")!;
        this.render();
        this.setupEventListeners();
        this.checkHealth();
    }

    private render(): void {
        this.app.innerHTML = `
      <div class="container mx-auto px-4 py-8">
        <div class="max-w-2xl mx-auto">
          ${renderHeader()}
          ${renderFormSection()}
          ${renderResultsSection()}
          ${renderAnalysisSection()}
        </div>
      </div>
    `;
    }

    private setupEventListeners(): void {
        const form = document.getElementById("shortenForm") as HTMLFormElement;
        const copyBtn = document.getElementById("copyBtn") as HTMLButtonElement;
        const newUrlBtn = document.getElementById("newUrlBtn") as HTMLButtonElement;
        const analyzeBtn = document.getElementById(
            "analyzeBtn",
        ) as HTMLButtonElement;

        form.addEventListener("submit", this.handleSubmit.bind(this));
        copyBtn.addEventListener("click", this.copyToClipboard.bind(this));
        newUrlBtn.addEventListener("click", this.resetForm.bind(this));
        analyzeBtn.addEventListener("click", this.analyzeUrl.bind(this));
    }

    private async handleSubmit(e: Event): Promise<void> {
        e.preventDefault();

        const urlInput = document.getElementById("urlInput") as HTMLInputElement;
        const url = urlInput.value.trim();

        if (!url) return;

        this.showLoading(true);
        this.hideError();

        try {
            const data = await shortenUrl(url);

            this.showResults(data);
        } catch (error) {
            this.showError(
                error instanceof Error
                    ? error.message
                    : "Failed to shorten URL. Please check your connection and try again.",
            );
            console.error("Error:", error);
        } finally {
            this.showLoading(false);
        }
    }

    private async analyzeUrl(): Promise<void> {
        const analyzeInput = document.getElementById(
            "analyzeInput",
        ) as HTMLInputElement;
        const url = analyzeInput.value.trim();
        if (!url) return;

        this.showAnalysisLoading(true);
        this.hideAnalysisResults();

        try {
            const analysis = await analyzeUrlOrigin(url);
            this.showAnalysisResults(analysis);
        } catch (error) {
            this.showAnalysisResults({
                origin: "",
                error: error instanceof Error ? error.message : "Failed to analyze URL",
            });
        } finally {
            this.showAnalysisLoading(false);
        }
    }

    private showLoading(show: boolean): void {
        const loading = document.getElementById("loading")!;
        const form = document.getElementById("shortenForm")!;

        if (show) {
            loading.classList.remove("hidden");
            form.classList.add("hidden");
        } else {
            loading.classList.add("hidden");
            form.classList.remove("hidden");
        }
    }

    private showError(message: string): void {
        const errorDiv = document.getElementById("error")!;
        const errorMessage = document.getElementById("errorMessage")!;

        errorMessage.textContent = message;
        errorDiv.classList.remove("hidden");
    }

    private hideError(): void {
        const errorDiv = document.getElementById("error")!;
        errorDiv.classList.add("hidden");
    }

    private showResults(data: ShortenResponse): void {
        const results = document.getElementById("results")!;
        const shortUrlResult = document.getElementById(
            "shortUrlResult",
        ) as HTMLInputElement;
        const originalUrlResult = document.getElementById(
            "originalUrlResult",
        ) as HTMLInputElement;

        shortUrlResult.value = data.shortUrl;
        originalUrlResult.value = data.originalUrl;

        results.classList.remove("hidden");
        results.scrollIntoView({behavior: "smooth"});
    }

    private async copyToClipboard(): Promise<void> {
        const shortUrlResult = document.getElementById(
            "shortUrlResult",
        ) as HTMLInputElement;
        const copyBtn = document.getElementById("copyBtn")!;

        try {
            await navigator.clipboard.writeText(shortUrlResult.value);

            copyBtn.innerHTML = `
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
            `;

            setTimeout(() => {
                copyBtn.innerHTML = `
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
                `;
            }, 2000);
        } catch (err) {
            console.error("Failed to copy: ", err);
        }
    }

    private resetForm(): void {
        const form = document.getElementById("shortenForm") as HTMLFormElement;
        const results = document.getElementById("results")!;
        const urlInput = document.getElementById("urlInput") as HTMLInputElement;

        form.reset();
        results.classList.add("hidden");
        urlInput.focus();
        this.hideError();
    }

    private showAnalysisLoading(show: boolean): void {
        const loading = document.getElementById("analysisLoading")!;
        const results = document.getElementById("analysisResults")!;
        if (show) {
            loading.classList.remove("hidden");
            results.classList.add("hidden");
        } else {
            loading.classList.add("hidden");
        }
    }

    private hideAnalysisResults(): void {
        document.getElementById("analysisResults")!.classList.add("hidden");
    }

    private showAnalysisResults(analysis: UrlAnalysis): void {
        const results = document.getElementById("analysisResults")!;
        const content = document.getElementById("analysisContent")!;
        if (analysis.error) {
            content.innerHTML = `<p class="text-red-300"><strong>Error:</strong> ${analysis.error}</p>`;
        } else {
            content.innerHTML = `<p class="text-zinc-200"><strong>Origin:</strong> ${analysis.origin}</p>`;
        }
        results.classList.remove("hidden");
    }

    private async checkHealth(): Promise<void> {
        const healthStatus = document.getElementById("healthStatus")!;
        const status = await checkApiHealth();
        healthStatus.className = status
            ? "w-3 h-3 rounded-full bg-green-500"
            : "w-3 h-3 rounded-full bg-red-500";
    }
}

new URLShortener();
