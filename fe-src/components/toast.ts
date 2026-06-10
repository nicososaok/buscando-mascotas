export class NotificationToast extends HTMLElement {
  connectedCallback() {
    const message = this.getAttribute("message") || "";
    const type = this.getAttribute("type") || "success";

    this.innerHTML = `
         <style>
            .toast-container {
               position: fixed;
               bottom: 20px;
               right: 20px;
               background-color: ${type === "success" ? "#2ecc71" : "#e74c3c"};
               color: white;
               padding: 12px 24px;
               border-radius: 6px;
               font-family: 'Inter', sans-serif;
               font-weight: 600;
               font-size: 14px;
               box-shadow: 0 4px 12px rgba(0,0,0,0.15);
               z-index: 9999;
               display: flex;
               align-items: center;
               gap: 8px;
               animation: slideIn 0.3s ease-out forwards;
            }
            @keyframes slideIn {
               from { transform: translateY(100px); opacity: 0; }
               to { transform: translateY(0); opacity: 1; }
            }
         </style>
         <div class="toast-container">
            ${type === "success" ? "✅" : "❌"} ${message}
         </div>
      `;

    setTimeout(() => {
      this.remove();
    }, 3000);
  }
}
customElements.define("notification-toast", NotificationToast);

export function showToast(message: string, type: "success" | "error" = "success") {
  const toast = document.createElement("notification-toast");
  toast.setAttribute("message", message);
  toast.setAttribute("type", type);
  document.body.appendChild(toast);
}