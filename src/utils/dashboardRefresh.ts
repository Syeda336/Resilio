// Event emitter for dashboard refresh
type RefreshListener = () => void;

class DashboardRefresh {
  private listeners: RefreshListener[] = [];

  subscribe(listener: RefreshListener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  trigger() {
    console.log('🔄 Triggering dashboard refresh for all listeners');
    this.listeners.forEach(listener => listener());
  }
}

export const dashboardRefresh = new DashboardRefresh();
