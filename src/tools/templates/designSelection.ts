export interface DesignInput {
  design_name_1: string;
  design_html_1: string;
  design_name_2: string;
  design_html_2: string;
  design_name_3: string;
  design_html_3: string;
}

export function generateDesignSelectionHTML(input: DesignInput): string {
  // Sanitize design names to prevent XSS
  const sanitizeName = (name: string) => {
    return name.replace(/[<>'"]/g, '');
  };
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>UI Component Selection</title>
      <style>
        * {
          box-sizing: border-box;
        }
        
        body { 
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
          margin: 0; 
          padding: 20px;
          background-color: #f9f9f9;
          overflow-x: hidden;
        }
        
        h1 {
          text-align: center;
          margin-bottom: 10px;
          color: #333;
          animation: fadeIn 0.5s ease-out;
        }
        
        .subtitle {
          text-align: center;
          margin-bottom: 30px;
          color: #666;
          font-size: 16px;
          animation: fadeIn 0.5s ease-out 0.1s both;
        }
        
        .connection-status {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.3s ease;
          z-index: 1000;
        }
        
        .connection-status.connected {
          background-color: #10B981;
          color: white;
        }
        
        .connection-status.disconnected {
          background-color: #EF4444;
          color: white;
        }
        
        .connection-status.connecting {
          background-color: #F59E0B;
          color: white;
        }
        
        .designs-container {
          display: flex;
          flex-wrap: wrap;
          gap: 30px;
          justify-content: center;
          margin-bottom: 60px;
        }
        
        .design-container { 
          flex: 1 1 300px;
          max-width: 500px;
          margin-bottom: 30px; 
          padding: 20px; 
          border: 1px solid #eaeaea; 
          border-radius: 8px;
          background-color: white;
          box-shadow: 0 2px 5px rgba(0,0,0,0.05);
          transition: all 0.3s ease;
          animation: slideUp 0.5s ease-out both;
          position: relative;
          cursor: pointer;
        }
        
        .design-container:nth-child(1) { animation-delay: 0.1s; }
        .design-container:nth-child(2) { animation-delay: 0.2s; }
        .design-container:nth-child(3) { animation-delay: 0.3s; }
        
        .design-container:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.1);
          border-color: #0070f3;
        }
        
        .design-container.selected {
          border-color: #10B981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
        }
        
        .design-name { 
          font-size: 20px; 
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 1px solid #f0f0f0;
          color: #222;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .keyboard-hint {
          font-size: 12px;
          padding: 2px 8px;
          background-color: #f3f4f6;
          border-radius: 4px;
          color: #6b7280;
          font-weight: 500;
        }
        
        .design-content {
          margin-bottom: 20px;
          min-height: 100px;
          padding: 15px;
          border: 1px dashed #eaeaea;
          border-radius: 4px;
          background-color: #fafafa;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        
        .design-container:hover .design-content {
          border-color: #0070f3;
          background-color: #f0f9ff;
        }
        
        .component-wrapper {
          margin: 0 auto;
          transition: transform 0.3s ease;
        }
        
        .design-content:hover .component-wrapper {
          transform: scale(1.02);
        }
        
        .zoom-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.9);
          display: none;
          z-index: 2000;
          cursor: zoom-out;
          padding: 40px;
          overflow: auto;
        }
        
        .zoom-content {
          background-color: white;
          border-radius: 8px;
          max-width: 90vw;
          margin: 0 auto;
          padding: 40px;
          position: relative;
          animation: zoomIn 0.3s ease-out;
        }
        
        .zoom-close {
          position: absolute;
          top: 20px;
          right: 20px;
          width: 40px;
          height: 40px;
          border: none;
          background-color: #f3f4f6;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }
        
        .zoom-close:hover {
          background-color: #e5e7eb;
          transform: scale(1.1);
        }
        
        .selection-feedback {
          position: fixed;
          top: 80px;
          right: 20px;
          padding: 15px 20px;
          background-color: #10B981;
          color: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          display: none;
          z-index: 100;
          animation: slideInRight 0.3s ease-out;
        }
        
        .loading-state {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid #f3f4f6;
          border-top-color: #0070f3;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-right: 8px;
          vertical-align: middle;
        }
        
        .instructions {
          max-width: 700px;
          margin: 0 auto 30px;
          padding: 15px;
          background-color: #e0f2fe;
          border-radius: 8px;
          color: #075985;
          animation: fadeIn 0.5s ease-out 0.2s both;
        }
        
        .buttons-container {
          text-align: center;
          margin-top: 15px;
        }
        
        button { 
          padding: 12px 24px; 
          font-size: 16px; 
          margin: 5px;
          background-color: #0070f3;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-weight: 500;
          position: relative;
          overflow: hidden;
        }
        
        button:hover {
          background-color: #0051cc;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 112, 243, 0.3);
        }
        
        button:active {
          transform: translateY(0);
          box-shadow: 0 2px 4px rgba(0, 112, 243, 0.3);
        }
        
        button.selected {
          background-color: #10B981;
          animation: pulse 0.5s ease-out;
        }
        
        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .component-label {
          display: inline-block;
          padding: 3px 8px;
          background-color: #f0f0f0;
          border-radius: 4px;
          font-size: 12px;
          margin-bottom: 10px;
          color: #666;
        }
        
        .code-toggle {
          position: absolute;
          top: 10px;
          right: 10px;
          padding: 6px 12px;
          background-color: #1f2937;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          z-index: 10;
        }
        
        .code-toggle:hover {
          background-color: #374151;
        }
        
        .code-view {
          display: none;
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #1f2937;
          color: #e5e7eb;
          padding: 15px;
          overflow: auto;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 13px;
          line-height: 1.5;
          white-space: pre-wrap;
          word-break: break-all;
        }
        
        .code-view.show {
          display: block;
        }
        
        .copy-button {
          position: absolute;
          top: 10px;
          right: 10px;
          padding: 6px 12px;
          background-color: #374151;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .copy-button:hover {
          background-color: #4b5563;
        }
        
        .copy-button.copied {
          background-color: #10B981;
        }
        
        .error-message {
          background-color: #fee2e2;
          border: 1px solid #fecaca;
          color: #991b1b;
          padding: 12px;
          border-radius: 6px;
          margin: 20px auto;
          max-width: 600px;
          text-align: center;
          animation: shake 0.5s ease-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideInRight {
          from { 
            opacity: 0;
            transform: translateX(20px);
          }
          to { 
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes zoomIn {
          from { 
            opacity: 0;
            transform: scale(0.9);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        
        @media (max-width: 768px) {
          .designs-container {
            flex-direction: column;
            align-items: center;
          }
          .design-container {
            flex: 1 1 auto;
            max-width: 100%;
          }
          .connection-status {
            top: 10px;
            right: 10px;
            font-size: 12px;
          }
          .zoom-content {
            padding: 20px;
          }
        }
        
        /* Touch device improvements */
        @media (hover: none) {
          .design-container:active {
            transform: scale(0.98);
          }
        }
      </style>
    </head>
    <body>
      <div class="connection-status connecting" id="connectionStatus">
        <span class="loading-state"></span> Connecting...
      </div>
      
      <h1>UI Component Selection</h1>
      <p class="subtitle">Compare different design options for individual UI components</p>
      
      <div class="instructions">
        <p><strong>Select your preferred component design.</strong> Click on a design to zoom in, or use keyboard shortcuts (1, 2, 3) for quick selection.</p>
      </div>
      
      <div class="selection-feedback" id="selectionFeedback"></div>
      
      <div class="designs-container">
        <div class="design-container" data-design="${sanitizeName(input.design_name_1)}" data-index="1">
          <div class="design-name">
            ${sanitizeName(input.design_name_1)}
            <span class="keyboard-hint">Press 1</span>
          </div>
          <div class="component-label">UI Component</div>
          <div class="design-content">
            <button class="code-toggle" onclick="toggleCode(event, 1)">View Code</button>
            <div class="component-wrapper">${input.design_html_1}</div>
            <div class="code-view" id="codeView1">
              <button class="copy-button" onclick="copyCode(event, '${btoa(input.design_html_1)}')">Copy</button>
              <code>${escapeHtml(input.design_html_1)}</code>
            </div>
          </div>
          <div class="buttons-container">
            <button id="btn1" onclick="selectDesign('${sanitizeName(input.design_name_1)}', 'btn1', '${btoa(input.design_html_1)}')">Select This Component</button>
          </div>
        </div>

        <div class="design-container" data-design="${sanitizeName(input.design_name_2)}" data-index="2">
          <div class="design-name">
            ${sanitizeName(input.design_name_2)}
            <span class="keyboard-hint">Press 2</span>
          </div>
          <div class="component-label">UI Component</div>
          <div class="design-content">
            <button class="code-toggle" onclick="toggleCode(event, 2)">View Code</button>
            <div class="component-wrapper">${input.design_html_2}</div>
            <div class="code-view" id="codeView2">
              <button class="copy-button" onclick="copyCode(event, '${btoa(input.design_html_2)}')">Copy</button>
              <code>${escapeHtml(input.design_html_2)}</code>
            </div>
          </div>
          <div class="buttons-container">
            <button id="btn2" onclick="selectDesign('${sanitizeName(input.design_name_2)}', 'btn2', '${btoa(input.design_html_2)}')">Select This Component</button>
          </div>
        </div>

        <div class="design-container" data-design="${sanitizeName(input.design_name_3)}" data-index="3">
          <div class="design-name">
            ${sanitizeName(input.design_name_3)}
            <span class="keyboard-hint">Press 3</span>
          </div>
          <div class="component-label">UI Component</div>
          <div class="design-content">
            <button class="code-toggle" onclick="toggleCode(event, 3)">View Code</button>
            <div class="component-wrapper">${input.design_html_3}</div>
            <div class="code-view" id="codeView3">
              <button class="copy-button" onclick="copyCode(event, '${btoa(input.design_html_3)}')">Copy</button>
              <code>${escapeHtml(input.design_html_3)}</code>
            </div>
          </div>
          <div class="buttons-container">
            <button id="btn3" onclick="selectDesign('${sanitizeName(input.design_name_3)}', 'btn3', '${btoa(input.design_html_3)}')">Select This Component</button>
          </div>
        </div>
      </div>
      
      <div class="zoom-overlay" id="zoomOverlay" onclick="closeZoom()">
        <div class="zoom-content" onclick="event.stopPropagation()">
          <button class="zoom-close" onclick="closeZoom()">✕</button>
          <div id="zoomContentInner"></div>
        </div>
      </div>

      <script>
        let ws = null;
        let reconnectAttempts = 0;
        const maxReconnectAttempts = 5;
        let selectedDesignData = null;
        
        // Escape HTML for display
        function escapeHtml(html) {
          const div = document.createElement('div');
          div.textContent = html;
          return div.innerHTML;
        }
        
        // WebSocket connection
        function connectWebSocket() {
          const wsUrl = 'ws://' + window.location.host;
          ws = new WebSocket(wsUrl);
          
          ws.onopen = function() {
            console.log('WebSocket connected');
            reconnectAttempts = 0;
            updateConnectionStatus('connected', 'Connected');
          };
          
          ws.onclose = function() {
            console.log('WebSocket disconnected');
            updateConnectionStatus('disconnected', 'Disconnected');
            
            // Try to reconnect
            if (reconnectAttempts < maxReconnectAttempts) {
              reconnectAttempts++;
              setTimeout(connectWebSocket, 2000);
              updateConnectionStatus('connecting', 'Reconnecting...');
            }
          };
          
          ws.onerror = function(error) {
            console.error('WebSocket error:', error);
            updateConnectionStatus('disconnected', 'Connection Error');
          };
          
          ws.onmessage = function(event) {
            try {
              const data = JSON.parse(event.data);
              console.log('WebSocket message:', data);
              
              if (data.type === 'selection-confirmed') {
                showFeedback('Selection confirmed: ' + data.selectedDesign, 'success');
                setTimeout(() => {
                  window.close();
                }, 1500);
              } else if (data.type === 'finalized') {
                window.close();
              }
            } catch (error) {
              console.error('Error parsing WebSocket message:', error);
            }
          };
        }
        
        // Update connection status UI
        function updateConnectionStatus(status, text) {
          const statusEl = document.getElementById('connectionStatus');
          statusEl.className = 'connection-status ' + status;
          statusEl.innerHTML = status === 'connecting' 
            ? '<span class="loading-state"></span> ' + text
            : text;
        }
        
        // Show feedback message
        function showFeedback(message, type = 'success') {
          const feedback = document.getElementById('selectionFeedback');
          feedback.textContent = message;
          feedback.style.display = 'block';
          feedback.style.backgroundColor = type === 'success' ? '#10B981' : '#EF4444';
          
          if (type === 'success') {
            setTimeout(() => {
              feedback.style.display = 'none';
            }, 3000);
          }
        }
        
        // Toggle code view
        function toggleCode(event, index) {
          event.stopPropagation();
          const codeView = document.getElementById('codeView' + index);
          codeView.classList.toggle('show');
          event.target.textContent = codeView.classList.contains('show') ? 'Hide Code' : 'View Code';
        }
        
        // Copy code to clipboard
        function copyCode(event, encodedHtml) {
          event.stopPropagation();
          const html = atob(encodedHtml);
          navigator.clipboard.writeText(html).then(() => {
            event.target.textContent = 'Copied!';
            event.target.classList.add('copied');
            setTimeout(() => {
              event.target.textContent = 'Copy';
              event.target.classList.remove('copied');
            }, 2000);
          }).catch(() => {
            showFeedback('Failed to copy to clipboard', 'error');
          });
        }
        
        // Zoom functionality
        function showZoom(container) {
          const zoomOverlay = document.getElementById('zoomOverlay');
          const zoomContent = document.getElementById('zoomContentInner');
          const componentWrapper = container.querySelector('.component-wrapper');
          
          zoomContent.innerHTML = componentWrapper.innerHTML;
          zoomOverlay.style.display = 'flex';
          document.body.style.overflow = 'hidden';
        }
        
        function closeZoom() {
          const zoomOverlay = document.getElementById('zoomOverlay');
          zoomOverlay.style.display = 'none';
          document.body.style.overflow = '';
        }
        
        // Main selection function
        function selectDesign(name, btnId, encodedHtml) {
          console.log('Selection function called with: ' + name);
          
          // Store selected design data
          selectedDesignData = {
            name: name,
            html: atob(encodedHtml),
            timestamp: new Date().toISOString()
          };
          
          // Save to localStorage
          localStorage.setItem('lastSelectedDesign', JSON.stringify(selectedDesignData));
          
          // Update UI
          document.querySelectorAll('button').forEach(btn => {
            if (btn.id && btn.id.startsWith('btn')) {
              btn.disabled = true;
            }
          });
          
          document.querySelectorAll('.design-container').forEach(container => {
            container.classList.remove('selected');
          });
          
          document.getElementById(btnId).innerText = "Selected ✓";
          document.getElementById(btnId).classList.add('selected');
          document.getElementById(btnId).closest('.design-container').classList.add('selected');
          
          showFeedback('You selected: ' + name);
          
          // Send via WebSocket if connected
          if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: 'selection',
              selectedDesign: name
            }));
          } else {
            // Fallback to HTTP POST
            fetch('/design-selection-result', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ selectedDesign: name })
            })
            .then(response => {
              console.log('Server response status: ' + response.status);
              return response.json();
            })
            .then(data => {
              console.log('Server response data: ', data);
              setTimeout(() => {
                window.close();
              }, 1500);
            })
            .catch(error => {
              console.error('Error submitting selection:', error);
              showFeedback('Error submitting selection. Please try again.', 'error');
              
              // Re-enable buttons after error
              setTimeout(() => {
                document.querySelectorAll('button').forEach(btn => {
                  if (btn.id && btn.id.startsWith('btn')) {
                    btn.disabled = false;
                    if (btn.classList.contains('selected')) {
                      btn.innerText = 'Select This Component';
                      btn.classList.remove('selected');
                    }
                  }
                });
                document.querySelectorAll('.design-container').forEach(container => {
                  container.classList.remove('selected');
                });
              }, 3000);
            });
          }
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', function(event) {
          if (event.key >= '1' && event.key <= '3') {
            const index = parseInt(event.key);
            const btn = document.getElementById('btn' + index);
            if (btn && !btn.disabled) {
              btn.click();
            }
          } else if (event.key === 'Escape') {
            closeZoom();
          }
        });
        
        // Click to zoom on design containers
        document.querySelectorAll('.design-container').forEach((container, index) => {
          container.addEventListener('click', function(event) {
            // Don't zoom if clicking on buttons or interactive elements
            if (event.target.tagName === 'BUTTON' || 
                event.target.closest('.code-view') ||
                event.target.closest('.buttons-container')) {
              return;
            }
            showZoom(container);
          });
        });
        
        // Touch device support
        let touchStartY = 0;
        document.addEventListener('touchstart', function(event) {
          touchStartY = event.touches[0].clientY;
        });
        
        document.addEventListener('touchend', function(event) {
          const touchEndY = event.changedTouches[0].clientY;
          const deltaY = touchStartY - touchEndY;
          
          // Swipe up to close zoom
          if (Math.abs(deltaY) > 50 && document.getElementById('zoomOverlay').style.display === 'flex') {
            closeZoom();
          }
        });
        
        // Initialize WebSocket connection
        connectWebSocket();
        
        // Load last selection from localStorage
        const lastSelection = localStorage.getItem('lastSelectedDesign');
        if (lastSelection) {
          try {
            const data = JSON.parse(lastSelection);
            console.log('Last selection found:', data.name);
          } catch (error) {
            console.error('Error parsing last selection:', error);
          }
        }
        
        // Prevent window closing dialog
        window.onbeforeunload = null;
      </script>
    </body>
    </html>
  `;
}

function escapeHtml(html: string): string {
  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
} 