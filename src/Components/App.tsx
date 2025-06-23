import React from 'react';
import { Settings, Folder, User, Music, Terminal, Code, Home, FileText } from 'lucide-react'; // Importing icons from lucide-react

// Define interface for dock apps
interface DockApp {
    id: string;
    name: string;
    icon: string;
    content: React.ReactNode;
}

// Define interface for desktop files
interface DesktopFile {
    id: string;
    name: string;
    icon: string;
    type: 'document' | 'folder' | 'application';
    x: number; // For positioning on desktop
    y: number; // For positioning on desktop
    content?: React.ReactNode; // Content to display when the file is opened
}

// App definitions for the dock
const apps: DockApp[] = [
    {
        id: 'home',
        name: 'Home',
        icon: 'Home',
        content: (
            <div>
                <h2 className="app-title">Welcome Home!</h2>
                <p>This is your personal desktop environment.</p>
            </div>
        )
    },
    {
        id: 'about-me',
        name: 'About Me',
        icon: 'User',
        content: (
            <div>
                <h2 className="app-title">Hi, I'm [Your Name]!</h2>
                <p>A passionate developer.</p>
            </div>
        )
    },
    {
        id: 'lastfm',
        name: 'Last.fm',
        icon: 'Music',
        content: (
            <div>
                <h2 className="app-title">Last.fm Integration</h2>
                <p>Music details go here.</p>
            </div>
        )
    },
    {
        id: 'projects',
        name: 'Projects',
        icon: 'Folder',
        content: (
            <div>
                <h2 className="app-title">My Projects</h2>
                <p>Project list goes here.</p>
            </div>
        )
    },
    {
        id: 'settings',
        name: 'Settings',
        icon: 'Settings',
        content: (
            <div>
                <h2 className="app-title">Settings</h2>
                <p>Adjust your desktop preferences here.</p>
            </div>
        )
    },
    {
        id: 'terminal',
        name: 'Terminal',
        icon: 'Terminal',
        content: (
            <div>
                <h2 className="app-title">Terminal</h2>
                <pre className="terminal-output">
                    $ _
                </pre>
            </div>
        )
    },
];

// Helper component to render Lucide icons dynamically
const Icon = ({ name, size = 28, color = 'white' }: { name: string; size?: number; color?: string }) => {
    const LucideIcon = {
        Home, User, Music, Folder, Settings, Terminal, Code, FileText
    }[name];
    if (!LucideIcon) return null;
    return <LucideIcon size={size} color={color} />;
};

// Main App Component as a Class Component
export class App extends React.Component<{}, {
    desktopFiles: DesktopFile[],
    selectedFileIds: string[], // Array to hold multiple selected file IDs

    // For single file drag-and-drop on desktop
    draggingFileId: string | null,
    dragOffsetX: number,
    dragOffsetY: number,

    // For marquee selection
    selectionRect: { x1: number, y1: number, x2: number, y2: number, active: boolean },

    // For dock icon reordering
    dockIcons: DockApp[], // Dock icons are now part of state for reordering
    draggingDockItemId: string | null,
    draggedOverDockItemId: string | null,
    openApps: DockApp[];
}> {
    fileRefs: Map<string, HTMLDivElement>; // Map to store refs for each desktop file element
    desktopRef: React.RefObject<HTMLDivElement>; // Ref for the desktop background
    state: {};
    constructor(props: {}) {
        super(props);
        this.state = {
            desktopFiles: [
                { id: 'my-documents', name: 'My Documents', icon: 'Folder', type: 'folder', x: 50, y: 50 },
                { id: 'portfolio-readme', name: 'Portfolio Readme', icon: 'FileText', type: 'document', x: 50, y: 150 },
                { id: 'settings-shortcut', name: 'Settings', icon: 'Settings', type: 'application', x: 50, y: 250 },
            ],
            selectedFileIds: [], // Initialize with an empty array

            draggingFileId: null,
            dragOffsetX: 0,
            dragOffsetY: 0,

            selectionRect: { x1: 0, y1: 0, x2: 0, y2: 0, active: false },

            dockIcons: apps.filter(app => ['Home', 'Last.fm', 'Projects', 'Terminal'].includes(app.name)),
            draggingDockItemId: null,
            draggedOverDockItemId: null,
            openApps: [],
        };
        this.fileRefs = new Map();
        this.desktopRef = React.createRef();

        // Bind global event handlers
        this.handleGlobalMouseMove = this.handleGlobalMouseMove.bind(this);
        this.handleGlobalMouseUp = this.handleGlobalMouseUp.bind(this);
    }

    componentDidMount() {
        document.addEventListener('mousemove', this.handleGlobalMouseMove);
        document.addEventListener('mouseup', this.handleGlobalMouseUp);
    }

    componentWillUnmount() {
        document.removeEventListener('mousemove', this.handleGlobalMouseMove);
        document.removeEventListener('mouseup', this.handleGlobalMouseUp);
    }

    // --- Desktop File Selection and Dragging ---

    handleFileMouseDown = (fileId: string, e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation(); // Prevent desktop background click
        const { selectedFileIds } = this.state;

        let newSelectedFileIds = [...selectedFileIds];

        if (e.ctrlKey || e.metaKey) { // Ctrl/Cmd click to toggle selection
            if (newSelectedFileIds.includes(fileId)) {
                newSelectedFileIds = newSelectedFileIds.filter(id => id !== fileId);
            } else {
                newSelectedFileIds.push(fileId);
            }
        } else if (e.shiftKey) { // Shift click for range selection (simplified)
            // For simplicity, shift-click will add to selection if not already selected.
            // A full implementation would select all between last selected and current.
            if (!newSelectedFileIds.includes(fileId)) {
                newSelectedFileIds.push(fileId);
            }
        } else { // Regular click to select only this file
            newSelectedFileIds = [fileId];
        }

        const fileElement = this.fileRefs.get(fileId);
        if (fileElement) {
            const rect = fileElement.getBoundingClientRect();
            this.setState({
                selectedFileIds: newSelectedFileIds,
                draggingFileId: fileId, // Start dragging this file
                dragOffsetX: e.clientX - rect.left,
                dragOffsetY: e.clientY - rect.top,
                selectionRect: { ...this.state.selectionRect, active: false }, // End any active marquee selection
            });
            // Temporarily disable transition and bring to front for smooth dragging visual
            fileElement.style.transition = 'none';
            fileElement.style.zIndex = '1000';
            fileElement.style.cursor = 'grabbing';
        }
    };

    // --- Marquee Selection ---

    handleDesktopMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        // Only start marquee if not clicking on a file and not an icon
        if (e.target === this.desktopRef.current || (e.target as HTMLElement).classList.contains('desktop-background')) {
            this.setState({
                selectedFileIds: [], // Clear all selections on fresh desktop click
                draggingFileId: null, // Ensure no file is being dragged
                selectionRect: {
                    x1: e.clientX,
                    y1: e.clientY,
                    x2: e.clientX,
                    y2: e.clientY,
                    active: true,
                },
            });
        }
    };

    handleGlobalMouseMove = (e: MouseEvent) => {
        const { draggingFileId, selectionRect } = this.state;
        const desktopElement = this.desktopRef.current;

        if (desktopElement) {
            const desktopRect = desktopElement.getBoundingClientRect();

            // Handle file dragging
            if (draggingFileId) {
                const fileElement = this.fileRefs.get(draggingFileId);
                if (fileElement) {
                    const newX = e.clientX - desktopRect.left - this.state.dragOffsetX;
                    const newY = e.clientY - desktopRect.top - this.state.dragOffsetY;
                    fileElement.style.left = `${newX}px`;
                    fileElement.style.top = `${newY}px`;
                }
            }
            // Handle marquee selection
            else if (selectionRect.active) {
                this.setState(prevState => {
                    const currentX = e.clientX;
                    const currentY = e.clientY;
                    const updatedRect = { ...prevState.selectionRect, x2: currentX, y2: currentY };

                    // Calculate the actual selection rectangle's bounds
                    const selectX1 = Math.min(updatedRect.x1, updatedRect.x2);
                    const selectY1 = Math.min(updatedRect.y1, updatedRect.y2);
                    const selectX2 = Math.max(updatedRect.x1, updatedRect.x2);
                    const selectY2 = Math.max(updatedRect.y1, updatedRect.y2);

                    const newSelectedFileIds: string[] = [];
                    prevState.desktopFiles.forEach(file => {
                        const fileElement = this.fileRefs.get(file.id);
                        if (fileElement) {
                            const fileRect = fileElement.getBoundingClientRect();
                            // Check for intersection: https://developer.mozilla.org/en-US/docs/Web/API/DOMRect/intersects
                            const intersects = !(
                                selectX2 < fileRect.left ||
                                selectX1 > fileRect.right ||
                                selectY2 < fileRect.top ||
                                selectY1 > fileRect.bottom
                            );
                            if (intersects) {
                                newSelectedFileIds.push(file.id);
                            }
                        }
                    });

                    return {
                        ...prevState,
                        selectionRect: updatedRect,
                        selectedFileIds: newSelectedFileIds,
                    };
                });
            }
        }
    };

    handleGlobalMouseUp = (e: MouseEvent) => {
        const { draggingFileId } = this.state;

        // End file dragging
        if (draggingFileId) {
            const fileElement = this.fileRefs.get(draggingFileId);
            if (fileElement) {
                const finalX = parseFloat(fileElement.style.left || '0');
                const finalY = parseFloat(fileElement.style.top || '0');

                this.setState(prevState => ({
                    desktopFiles: prevState.desktopFiles.map(file =>
                        file.id === draggingFileId
                            ? { ...file, x: finalX, y: finalY }
                            : file
                    ),
                    draggingFileId: null,
                    dragOffsetX: 0,
                    dragOffsetY: 0,
                }));
                fileElement.style.transition = ''; // Re-enable transition
                fileElement.style.zIndex = ''; // Reset z-index
                fileElement.style.cursor = 'pointer'; // Reset cursor
            }
        }
        // End marquee selection
        else if (this.state.selectionRect.active) {
            this.setState(prevState => ({
                selectionRect: { ...prevState.selectionRect, active: false },
            }));
        }
    };

    // --- Dock Icon Reordering ---

    handleDockDragStart = (e: React.DragEvent<HTMLDivElement>, itemId: string) => {
        e.dataTransfer.setData('text/plain', itemId); // Set data for drag operation
        this.setState({ draggingDockItemId: itemId });
        // Optional: Add visual feedback for dragged item (e.g., opacity)
    };

    handleDockDragOver = (e: React.DragEvent<HTMLDivElement>, targetItemId: string) => {
        e.preventDefault(); // Allow drop
        const { draggingDockItemId, draggedOverDockItemId } = this.state;
        if (draggingDockItemId && draggingDockItemId !== targetItemId && draggedOverDockItemId !== targetItemId) {
            this.setState({ draggedOverDockItemId: targetItemId });
        }
    };

    handleDockDragLeave = () => {
        this.setState({ draggedOverDockItemId: null });
    };

    handleDockDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const draggedItemId = e.dataTransfer.getData('text/plain');
        const targetItemId = this.state.draggedOverDockItemId;

        if (draggedItemId && targetItemId && draggedItemId !== targetItemId) {
            this.setState(prevState => {
                const newDockIcons = [...prevState.dockIcons];
                const draggedIndex = newDockIcons.findIndex(item => item.id === draggedItemId);
                const targetIndex = newDockIcons.findIndex(item => item.id === targetItemId);

                if (draggedIndex === -1 || targetIndex === -1) return prevState;

                const [draggedItem] = newDockIcons.splice(draggedIndex, 1);
                newDockIcons.splice(targetIndex, 0, draggedItem);

                return {
                    ...prevState,
                    dockIcons: newDockIcons,
                    draggingDockItemId: null,
                    draggedOverDockItemId: null,
                };
            });
        } else {
            this.setState({ draggingDockItemId: null, draggedOverDockItemId: null });
        }
    };

    handleDockDragEnd = () => {
        this.setState({ draggingDockItemId: null, draggedOverDockItemId: null });
    };

    render() {
        const { desktopFiles, selectedFileIds, selectionRect, dockIcons, draggingDockItemId, draggedOverDockItemId } = this.state;

        // Calculate marquee selection rectangle styles
        const marqueeStyle = selectionRect.active ? {
            left: Math.min(selectionRect.x1, selectionRect.x2),
            top: Math.min(selectionRect.y1, selectionRect.y2),
            width: Math.abs(selectionRect.x1 - selectionRect.x2),
            height: Math.abs(selectionRect.y1 - selectionRect.y2),
            display: 'block',
        } : { display: 'none' };

        return (
            <div className="desktop-background" ref={this.desktopRef} onMouseDown={this.handleDesktopMouseDown}>
                {/* Marquee Selection Rectangle */}
                <div className="selection-marquee" style={marqueeStyle}></div>

                {/* Desktop Files */}
                {desktopFiles.map((file) => (
                    <div
                        key={file.id}
                        ref={el => { if (el) this.fileRefs.set(file.id, el); }}
                        className={`desktop-file ${selectedFileIds.includes(file.id) ? 'selected' : ''}`}
                        onMouseDown={(e) => this.handleFileMouseDown(file.id, e)}
                        style={{
                            position: 'absolute',
                            left: `${file.x}px`,
                            top: `${file.y}px`,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            cursor: this.state.draggingFileId ? 'grabbing' : 'pointer',
                            padding: '8px',
                            borderRadius: '8px',
                            transition: this.state.draggingFileId === file.id ? 'none' : 'background-color 0.1s, transform 0.2s ease-out, border 0.2s',
                            width: '80px',
                            textAlign: 'center',
                            transform: 'scale(1)',
                            zIndex: this.state.draggingFileId === file.id ? 1000 : undefined, // Bring dragged file to front
                        }}
                    >
                        <Icon name={file.icon} size={48} color={'white'} />
                        <span className="file-name" style={{
                            color: 'white',
                            fontSize: '0.75em',
                            marginTop: '4px',
                            wordBreak: 'break-word',
                        }}>{file.name}</span>
                    </div>
                ))}

                {/* Dock */}
                <div
                    className="dock"
                // Add handlers for dock reordering if needed on the dock container itself
                >
                    {dockIcons.map((app) => (
                        <div
                            key={app.id}
                            className={`dock-icon-wrapper ${draggingDockItemId === app.id ? 'dragging' : ''} ${draggedOverDockItemId === app.id ? 'drag-over' : ''}`}
                            draggable="true" // Make draggable
                            onDragStart={(e) => this.handleDockDragStart(e, app.id)}
                            onDragOver={(e) => this.handleDockDragOver(e, app.id)}
                            onDragLeave={this.handleDockDragLeave}
                            onDrop={this.handleDockDrop}
                            onDragEnd={this.handleDockDragEnd}
                        >
                            <div
                                className="dock-icon"
                                title={app.name}
                                onClick={() => console.log(`Dock icon clicked: ${app.name}`)}
                            >
                                <Icon name={app.icon} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
}

export default App;
