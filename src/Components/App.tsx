import React from 'react'; // Only need React for basic component
import { Settings, Folder, User, Music, Terminal, Code, Home } from 'lucide-react';

interface DockApp {
    id: string;
    name: string;
    icon: string;
    content: React.ReactNode;
}

const apps: DockApp[] = [
    {
        id: 'home',
        name: 'Home',
        icon: 'Home',
        content: (
            <div>
                <h2 className="app-title">Welcome Home!</h2>
                <p>This is your personal desktop environment.</p>
                <p>Click on the icons in the dock to open applications.</p>
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
                <p>I'm a passionate developer focusing on creating engaging web experiences. I love working with modern frontend frameworks like Preact and building robust backends with PHP.</p>
                <p>This portfolio is a showcase of my projects and a glimpse into my development journey.</p>
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
                <h3 className="section-title">Currently Listening To:</h3>
                <div className="lastfm-track-info">
                    <img src="https://placehold.co/80x80/000000/FFFFFF?text=Album" alt="Album Art" className="album-art" />
                    <div>
                        <p className="song-title">Song Title Goes Here</p>
                        <p className="artist-name">Artist Name</p>
                        <p className="album-name">Album Name</p>
                    </div>
                </div>
                <h3 className="section-title">Recent Tracks:</h3>
                <ul className="recent-tracks-list">
                    <li>Previous Song 1 - Artist A</li>
                    <li>Previous Song 2 - Artist B</li>
                    <li>Previous Song 3 - Artist C</li>
                </ul>
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
                <div className="projects-grid">
                    <div className="project-card">
                        <h3 className="project-title">Project Alpha</h3>
                        <p className="project-description">A brief description of Project Alpha, highlighting its purpose and technologies used.</p>
                    </div>
                    <div className="project-card">
                        <h3 className="project-title">Project Beta</h3>
                        <p className="project-description">Details about Project Beta, its features, and the challenges overcome during development.</p>
                    </div>
                </div>
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

// Icons displayed in the dock
const dockIcons: DockApp[] = apps.filter(app => ['Home', 'Last.fm', 'Projects', 'Terminal'].includes(app.name));

// Helper component to render Lucide icons dynamically (can remain functional)
const Icon = ({ name, size = 28, color = 'white' }: { name: string; size?: number; color?: string }) => {
    const LucideIcon = {
        Home, User, Music, Folder, Settings, Terminal, Code
    }[name];
    if (!LucideIcon) return null;
    return <LucideIcon size={size} color={color} />;
};

// Main App Component as a Class Component
export class App extends React.Component {
    render() {
        return (
            <div className="desktop-background">
                <div className="dock">
                    {dockIcons.map((app) => (
                        <div key={app.id} className="dock-icon-wrapper">
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
