const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Authentication methods
  async login(credentials: { username: string; password: string }) {
    const response = await this.request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (response.success && response.data.token) {
      this.token = response.data.token;
      localStorage.setItem('auth_token', this.token);
    }
    
    return response;
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.token = null;
      localStorage.removeItem('auth_token');
    }
  }

  async getProfile() {
    return this.request<any>('/auth/profile');
  }

  // Train methods
  async getTrains(params?: { status?: string; priority?: string; type?: string }) {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<any>(`/trains${queryString}`);
  }

  async getTrain(id: string) {
    return this.request<any>(`/trains/${id}`);
  }

  async updateTrainStatus(id: string, data: any) {
    return this.request<any>(`/trains/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getTrainRealTime(id: string) {
    return this.request<any>(`/trains/${id}/realtime`);
  }

  async emergencyStop(id: string, data: { reason: string; location: string }) {
    return this.request<any>(`/trains/${id}/emergency-stop`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Section methods
  async getSections() {
    return this.request<any>('/sections');
  }

  async getSection(id: string) {
    return this.request<any>(`/sections/${id}`);
  }

  async getSectionStatus(id: string) {
    return this.request<any>(`/sections/${id}/status`);
  }

  async getSectionTrains(id: string) {
    return this.request<any>(`/sections/${id}/trains`);
  }

  async getSectionCapacity(id: string) {
    return this.request<any>(`/sections/${id}/capacity`);
  }

  // Optimization methods
  async getRecommendations() {
    return this.request<any>('/optimization/recommendations');
  }

  async optimizeSection(sectionId: string, data?: any) {
    return this.request<any>(`/optimization/optimize/${sectionId}`, {
      method: 'POST',
      body: JSON.stringify(data || {}),
    });
  }

  async applyRecommendation(recommendationId: string, override = false) {
    return this.request<any>(`/optimization/apply/${recommendationId}`, {
      method: 'POST',
      body: JSON.stringify({ override }),
    });
  }

  async getOptimizationMetrics() {
    return this.request<any>('/optimization/metrics');
  }

  async runWhatIfAnalysis(scenario: string, parameters?: any) {
    return this.request<any>('/optimization/what-if', {
      method: 'POST',
      body: JSON.stringify({ scenario, parameters }),
    });
  }

  // Simulation methods
  async startSimulation(data: { scenario: string; parameters?: any; duration?: number }) {
    return this.request<any>('/simulation/start', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getSimulationStatus(simulationId: string) {
    return this.request<any>(`/simulation/${simulationId}/status`);
  }

  async getSimulationResults(simulationId: string) {
    return this.request<any>(`/simulation/${simulationId}/results`);
  }

  async stopSimulation(simulationId: string) {
    return this.request<any>(`/simulation/${simulationId}/stop`, {
      method: 'POST',
    });
  }

  async getSimulations(params?: { status?: string; limit?: number; offset?: number }) {
    const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return this.request<any>(`/simulation${queryString}`);
  }

  // Analytics methods
  async getDashboard(timeRange = '24h') {
    return this.request<any>(`/analytics/dashboard?timeRange=${timeRange}`);
  }

  async getPerformanceMetrics(params?: { metric?: string; period?: string; granularity?: string }) {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<any>(`/analytics/performance${queryString}`);
  }

  async getCostAnalysis(period = '30d') {
    return this.request<any>(`/analytics/costs?period=${period}`);
  }

  async getPassengerAnalytics() {
    return this.request<any>('/analytics/passengers');
  }

  async getPredictions(params?: { horizon?: string; confidence?: number }) {
    const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return this.request<any>(`/analytics/predictions${queryString}`);
  }

  // Alert methods
  async getAlerts(params?: { severity?: string; status?: string; limit?: number; offset?: number }) {
    const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return this.request<any>(`/alerts${queryString}`);
  }

  async getAlert(id: string) {
    return this.request<any>(`/alerts/${id}`);
  }

  async createAlert(data: any) {
    return this.request<any>('/alerts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAlertStatus(id: string, data: any) {
    return this.request<any>(`/alerts/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async acknowledgeAlert(id: string, data: any) {
    return this.request<any>(`/alerts/${id}/acknowledge`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAlertStats(period = '24h') {
    return this.request<any>(`/alerts/stats/summary?period=${period}`);
  }

  // Health check
  async getHealth() {
    return this.request<any>('/health');
  }

  // Set token for authenticated requests
  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  // Clear token
  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;