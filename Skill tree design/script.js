class SkillTreeDesigner {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.connectionsSvg = document.getElementById('connections-svg');
        this.nodePanel = document.getElementById('node-panel');
        
        this.nodes = [];
        this.connections = [];
        this.selectedNode = null;
        this.selectedConnection = null;
        this.currentTool = 'addNode';
        this.isConnecting = false;
        this.connectionStart = null;
        
        this.nodeCounter = 0;
        this.connectionCounter = 0;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setupCanvas();
        this.createInitialNode();
    }
    
    setupEventListeners() {
        // Canvas click events
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        this.canvas.addEventListener('mousedown', (e) => this.handleCanvasMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleCanvasMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleCanvasMouseUp(e));
        
        // Prevent context menu
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        
        // Size slider
        document.getElementById('node-size').addEventListener('input', (e) => {
            document.getElementById('size-value').textContent = e.target.value + 'px';
        });
        
        document.getElementById('panel-node-size').addEventListener('input', (e) => {
            document.getElementById('panel-size-value').textContent = e.target.value + 'px';
        });
    }
    
    setupCanvas() {
        // Set canvas size
        this.updateCanvasSize();
        window.addEventListener('resize', () => this.updateCanvasSize());
    }
    
    updateCanvasSize() {
        const rect = this.canvas.getBoundingClientRect();
        this.connectionsSvg.setAttribute('width', rect.width);
        this.connectionsSvg.setAttribute('height', rect.height);
    }
    
    createInitialNode() {
        const centerX = this.canvas.offsetWidth / 2 - 50;
        const centerY = this.canvas.offsetHeight / 2 - 50;
        this.addNode(centerX, centerY, 'Start');
    }
    
    addNode(x, y, name = 'New Node') {
        const nodeId = `node-${this.nodeCounter++}`;
        const node = document.createElement('div');
        node.className = 'skill-node';
        node.id = nodeId;
        node.textContent = name;
        node.style.left = x + 'px';
        node.style.top = y + 'px';
        
        // Node properties
        node.dataset.name = name;
        node.dataset.color = '#00ffff';
        node.dataset.size = '100';
        node.dataset.description = '';
        node.dataset.difficulty = 'beginner';
        
        // Add drag functionality
        this.makeNodeDraggable(node);
        
        // Add click handler
        node.addEventListener('click', (e) => {
            e.stopPropagation();
            this.selectNode(node);
        });
        
        this.canvas.appendChild(node);
        this.nodes.push(node);
        
        return node;
    }
    
    makeNodeDraggable(node) {
        let isDragging = false;
        let startX, startY, startLeft, startTop;
        
        node.addEventListener('mousedown', (e) => {
            if (this.currentTool === 'connect') return;
            
            isDragging = true;
            node.classList.add('dragging');
            this.selectNode(node);
            
            startX = e.clientX;
            startY = e.clientY;
            startLeft = parseInt(node.style.left);
            startTop = parseInt(node.style.top);
            
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            
            node.style.left = (startLeft + deltaX) + 'px';
            node.style.top = (startTop + deltaY) + 'px';
            
            // Update connections
            this.updateConnections();
        });
        
        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                node.classList.remove('dragging');
                
                // Add floating effect
                setTimeout(() => {
                    node.style.transition = 'all 0.3s ease';
                }, 100);
            }
        });
    }
    
    selectNode(node) {
        // Remove previous selection
        this.nodes.forEach(n => n.classList.remove('selected'));
        
        // Select new node
        node.classList.add('selected');
        this.selectedNode = node;
        
        // Update toolbar
        this.updateToolbar();
        
        // Open node panel
        this.openNodePanel();
    }
    
    updateToolbar() {
        if (!this.selectedNode) return;
        
        document.getElementById('node-name').value = this.selectedNode.dataset.name;
        document.getElementById('node-color').value = this.selectedNode.dataset.color;
        document.getElementById('node-size').value = this.selectedNode.dataset.size;
        document.getElementById('size-value').textContent = this.selectedNode.dataset.size + 'px';
        document.getElementById('node-description').value = this.selectedNode.dataset.description;
    }
    
    openNodePanel() {
        if (!this.selectedNode) return;
        
        // Update panel fields
        document.getElementById('panel-node-name').value = this.selectedNode.dataset.name;
        document.getElementById('panel-node-color').value = this.selectedNode.dataset.color;
        document.getElementById('panel-node-size').value = this.selectedNode.dataset.size;
        document.getElementById('panel-size-value').textContent = this.selectedNode.dataset.size + 'px';
        document.getElementById('panel-node-description').value = this.selectedNode.dataset.description;
        document.getElementById('panel-node-difficulty').value = this.selectedNode.dataset.difficulty;
        
        this.nodePanel.classList.add('open');
    }
    
    closeNodePanel() {
        this.nodePanel.classList.remove('open');
        this.selectedNode = null;
        this.nodes.forEach(n => n.classList.remove('selected'));
    }
    
    saveNodeChanges() {
        if (!this.selectedNode) return;
        
        const name = document.getElementById('panel-node-name').value;
        const color = document.getElementById('panel-node-color').value;
        const size = document.getElementById('panel-node-size').value;
        const description = document.getElementById('panel-node-description').value;
        const difficulty = document.getElementById('panel-node-difficulty').value;
        
        // Update node
        this.selectedNode.textContent = name;
        this.selectedNode.dataset.name = name;
        this.selectedNode.dataset.color = color;
        this.selectedNode.dataset.size = size;
        this.selectedNode.dataset.description = description;
        this.selectedNode.dataset.difficulty = difficulty;
        
        // Update visual properties
        this.updateNodeAppearance(this.selectedNode);
        
        this.closeNodePanel();
    }
    
    updateNodeAppearance(node) {
        const color = node.dataset.color;
        const size = node.dataset.size;
        
        node.style.width = size + 'px';
        node.style.height = size + 'px';
        node.style.borderColor = color;
        node.style.backgroundColor = color + '20';
        node.style.boxShadow = `0 0 30px 5px ${color}50`;
    }
    
    setTool(tool) {
        this.currentTool = tool;
        
        // Update button states
        document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(tool + '-btn').classList.add('active');
        
        // Reset connection state
        this.isConnecting = false;
        this.connectionStart = null;
    }
    
    handleCanvasClick(e) {
        if (this.currentTool === 'addNode') {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left - 50;
            const y = e.clientY - rect.top - 50;
            this.addNode(x, y);
        }
    }
    
    handleCanvasMouseDown(e) {
        if (this.currentTool === 'connect') {
            // Find node under mouse
            const element = document.elementFromPoint(e.clientX, e.clientY);
            const node = element?.closest('.skill-node');
            
            if (node) {
                this.isConnecting = true;
                this.connectionStart = node;
                node.style.borderColor = '#ecad29';
            }
        }
    }
    
    handleCanvasMouseMove(e) {
        if (this.isConnecting && this.connectionStart) {
            // Draw temporary connection line
            this.drawTemporaryConnection(e);
        }
    }
    
    handleCanvasMouseUp(e) {
        if (this.isConnecting && this.connectionStart) {
            const element = document.elementFromPoint(e.clientX, e.clientY);
            const targetNode = element?.closest('.skill-node');
            
            if (targetNode && targetNode !== this.connectionStart) {
                this.createConnection(this.connectionStart, targetNode);
            }
            
            // Reset connection state
            this.connectionStart.style.borderColor = this.connectionStart.dataset.color;
            this.isConnecting = false;
            this.connectionStart = null;
            this.clearTemporaryConnection();
        }
    }
    
    drawTemporaryConnection(e) {
        this.clearTemporaryConnection();
        
        const rect = this.canvas.getBoundingClientRect();
        const startRect = this.connectionStart.getBoundingClientRect();
        const startX = startRect.left + startRect.width / 2 - rect.left;
        const startY = startRect.top + startRect.height / 2 - rect.top;
        const endX = e.clientX - rect.left;
        const endY = e.clientY - rect.top;
        
        const path = this.createCurvedPath(startX, startY, endX, endY);
        
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        line.setAttribute('d', path);
        line.setAttribute('class', 'connection-line');
        line.setAttribute('stroke', '#ecad29');
        line.setAttribute('stroke-width', '2');
        line.setAttribute('stroke-dasharray', '5,5');
        line.id = 'temp-connection';
        
        this.connectionsSvg.appendChild(line);
    }
    
    clearTemporaryConnection() {
        const tempLine = document.getElementById('temp-connection');
        if (tempLine) {
            tempLine.remove();
        }
    }
    
    createConnection(fromNode, toNode) {
        const connectionId = `connection-${this.connectionCounter++}`;
        
        const connection = {
            id: connectionId,
            from: fromNode.id,
            to: toNode.id,
            fromNode: fromNode,
            toNode: toNode
        };
        
        this.connections.push(connection);
        this.drawConnection(connection);
    }
    
    drawConnection(connection) {
        const fromRect = connection.fromNode.getBoundingClientRect();
        const toRect = connection.toNode.getBoundingClientRect();
        const canvasRect = this.canvas.getBoundingClientRect();
        
        const startX = fromRect.left + fromRect.width / 2 - canvasRect.left;
        const startY = fromRect.top + fromRect.height / 2 - canvasRect.top;
        const endX = toRect.left + toRect.width / 2 - canvasRect.left;
        const endY = toRect.top + toRect.height / 2 - canvasRect.top;
        
        const path = this.createCurvedPath(startX, startY, endX, endY);
        
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        line.setAttribute('d', path);
        line.setAttribute('class', 'connection-line');
        line.setAttribute('data-connection-id', connection.id);
        
        this.connectionsSvg.appendChild(line);
    }
    
    createCurvedPath(startX, startY, endX, endY) {
        const midX = (startX + endX) / 2;
        const midY = (startY + endY) / 2;
        
        // Create a curved path with control points
        const controlOffset = Math.abs(endX - startX) * 0.3;
        const control1X = startX + controlOffset;
        const control1Y = startY;
        const control2X = endX - controlOffset;
        const control2Y = endY;
        
        return `M ${startX} ${startY} C ${control1X} ${control1Y}, ${control2X} ${control2Y}, ${endX} ${endY}`;
    }
    
    updateConnections() {
        // Clear all connections
        this.connectionsSvg.innerHTML = '';
        
        // Redraw all connections
        this.connections.forEach(connection => {
            this.drawConnection(connection);
        });
    }
    
    deleteSelectedNode() {
        if (!this.selectedNode) return;
        
        // Remove connections involving this node
        this.connections = this.connections.filter(conn => {
            if (conn.from === this.selectedNode.id || conn.to === this.selectedNode.id) {
                return false;
            }
            return true;
        });
        
        // Remove node
        this.selectedNode.remove();
        this.nodes = this.nodes.filter(node => node !== this.selectedNode);
        
        // Update connections display
        this.updateConnections();
        
        this.closeNodePanel();
    }
    
    duplicateNode() {
        if (!this.selectedNode) return;
        
        const rect = this.selectedNode.getBoundingClientRect();
        const canvasRect = this.canvas.getBoundingClientRect();
        const x = rect.left - canvasRect.left + 50;
        const y = rect.top - canvasRect.top + 50;
        
        const newNode = this.addNode(x, y, this.selectedNode.dataset.name + ' Copy');
        
        // Copy properties
        newNode.dataset.color = this.selectedNode.dataset.color;
        newNode.dataset.size = this.selectedNode.dataset.size;
        newNode.dataset.description = this.selectedNode.dataset.description;
        newNode.dataset.difficulty = this.selectedNode.dataset.difficulty;
        
        this.updateNodeAppearance(newNode);
        this.selectNode(newNode);
    }
    
    centerCanvas() {
        if (this.nodes.length === 0) return;
        
        // Calculate center of all nodes
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        
        this.nodes.forEach(node => {
            const x = parseInt(node.style.left);
            const y = parseInt(node.style.top);
            minX = Math.min(minX, x);
            maxX = Math.max(maxX, x);
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y);
        });
        
        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;
        const canvasCenterX = this.canvas.offsetWidth / 2;
        const canvasCenterY = this.canvas.offsetHeight / 2;
        
        const offsetX = canvasCenterX - centerX;
        const offsetY = canvasCenterY - centerY;
        
        // Move all nodes
        this.nodes.forEach(node => {
            const currentX = parseInt(node.style.left);
            const currentY = parseInt(node.style.top);
            node.style.left = (currentX + offsetX) + 'px';
            node.style.top = (currentY + offsetY) + 'px';
        });
        
        this.updateConnections();
    }
    
    handleKeyDown(e) {
        if (e.key === 'Delete' && this.selectedNode) {
            this.deleteSelectedNode();
        } else if (e.key === 'Escape') {
            this.closeNodePanel();
        }
    }
    
    // Utility functions for external access
    setNodeColor(color) {
        document.getElementById('panel-node-color').value = color;
    }
    
    addPrerequisite() {
        // Implementation for adding prerequisites
        console.log('Add prerequisite functionality');
    }
}

// Global functions for HTML onclick handlers
let designer;

function setTool(tool) {
    designer.setTool(tool);
}

function updateSelectedNode() {
    if (!designer.selectedNode) return;
    
    const name = document.getElementById('node-name').value;
    const color = document.getElementById('node-color').value;
    const size = document.getElementById('node-size').value;
    const description = document.getElementById('node-description').value;
    
    designer.selectedNode.textContent = name;
    designer.selectedNode.dataset.name = name;
    designer.selectedNode.dataset.color = color;
    designer.selectedNode.dataset.size = size;
    designer.selectedNode.dataset.description = description;
    
    designer.updateNodeAppearance(designer.selectedNode);
}

function deleteSelectedNode() {
    designer.deleteSelectedNode();
}

function duplicateNode() {
    designer.duplicateNode();
}

function centerCanvas() {
    designer.centerCanvas();
}

function closeNodePanel() {
    designer.closeNodePanel();
}

function saveNodeChanges() {
    designer.saveNodeChanges();
}

function setNodeColor(color) {
    designer.setNodeColor(color);
}

function addPrerequisite() {
    designer.addPrerequisite();
}

// Navigation functions
function saveTree() {
    const treeData = {
        nodes: designer.nodes.map(node => ({
            id: node.id,
            name: node.dataset.name,
            x: parseInt(node.style.left),
            y: parseInt(node.style.top),
            color: node.dataset.color,
            size: node.dataset.size,
            description: node.dataset.description,
            difficulty: node.dataset.difficulty
        })),
        connections: designer.connections.map(conn => ({
            from: conn.from,
            to: conn.to
        }))
    };
    
    const dataStr = JSON.stringify(treeData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'skill-tree.json';
    link.click();
    
    URL.revokeObjectURL(url);
}

function loadTree() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const treeData = JSON.parse(e.target.result);
                    loadTreeData(treeData);
                } catch (error) {
                    alert('Error loading tree file: ' + error.message);
                }
            };
            reader.readAsText(file);
        }
    };
    input.click();
}

function loadTreeData(treeData) {
    // Clear existing nodes and connections
    designer.nodes.forEach(node => node.remove());
    designer.nodes = [];
    designer.connections = [];
    designer.connectionsSvg.innerHTML = '';
    
    // Load nodes
    treeData.nodes.forEach(nodeData => {
        const node = designer.addNode(nodeData.x, nodeData.y, nodeData.name);
        node.dataset.color = nodeData.color;
        node.dataset.size = nodeData.size;
        node.dataset.description = nodeData.description;
        node.dataset.difficulty = nodeData.difficulty;
        designer.updateNodeAppearance(node);
    });
    
    // Load connections
    treeData.connections.forEach(connData => {
        const fromNode = document.getElementById(connData.from);
        const toNode = document.getElementById(connData.to);
        if (fromNode && toNode) {
            designer.createConnection(fromNode, toNode);
        }
    });
}

function exportTree() {
    // Export as image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = designer.canvas.offsetWidth;
    canvas.height = designer.canvas.offsetHeight;
    
    // Draw background
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw connections
    designer.connections.forEach(conn => {
        const fromRect = conn.fromNode.getBoundingClientRect();
        const toRect = conn.toNode.getBoundingClientRect();
        const canvasRect = designer.canvas.getBoundingClientRect();
        
        const startX = fromRect.left - canvasRect.left;
        const startY = fromRect.top - canvasRect.top;
        const endX = toRect.left - canvasRect.left;
        const endY = toRect.top - canvasRect.top;
        
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(startX + fromRect.width/2, startY + fromRect.height/2);
        ctx.lineTo(endX + toRect.width/2, endY + toRect.height/2);
        ctx.stroke();
    });
    
    // Draw nodes
    designer.nodes.forEach(node => {
        const rect = node.getBoundingClientRect();
        const canvasRect = designer.canvas.getBoundingClientRect();
        const x = rect.left - canvasRect.left;
        const y = rect.top - canvasRect.top;
        const size = parseInt(node.dataset.size);
        
        ctx.fillStyle = node.dataset.color + '20';
        ctx.strokeStyle = node.dataset.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x + size/2, y + size/2, size/2, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        
        // Draw text
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px Inter';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.dataset.name, x + size/2, y + size/2);
    });
    
    // Download image
    const link = document.createElement('a');
    link.download = 'skill-tree.png';
    link.href = canvas.toDataURL();
    link.click();
}

function clearCanvas() {
    if (confirm('Are you sure you want to clear the canvas? This action cannot be undone.')) {
        designer.nodes.forEach(node => node.remove());
        designer.nodes = [];
        designer.connections = [];
        designer.connectionsSvg.innerHTML = '';
        designer.closeNodePanel();
        designer.createInitialNode();
    }
}

// Initialize designer when page loads
document.addEventListener('DOMContentLoaded', () => {
    designer = new SkillTreeDesigner();
});
