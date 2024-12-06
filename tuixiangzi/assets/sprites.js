const SPRITES = {
    WALL: `<svg viewBox="0 0 40 40">
        <rect width="40" height="40" fill="#8B7355"/>
        <rect x="2" y="2" width="36" height="36" fill="#A0522D"/>
        <rect x="4" y="4" width="32" height="32" fill="#8B4513"/>
    </svg>`,
    
    BOX: `<svg viewBox="0 0 40 40">
        <rect width="40" height="40" rx="4" fill="#DEB887"/>
        <rect x="4" y="4" width="32" height="32" rx="2" fill="#D2691E"/>
        <line x1="8" y1="8" x2="32" y2="32" stroke="#8B4513" stroke-width="2"/>
        <line x1="32" y1="8" x2="8" y2="32" stroke="#8B4513" stroke-width="2"/>
    </svg>`,
    
    TARGET: `<svg viewBox="0 0 40 40">
        <circle cx="20" cy="20" r="16" fill="none" stroke="#4CAF50" stroke-width="4"/>
        <circle cx="20" cy="20" r="8" fill="#4CAF50"/>
    </svg>`,
    
    PLAYER: `<svg viewBox="0 0 40 40">
        <circle cx="20" cy="20" r="18" fill="#1E90FF"/>
        <circle cx="20" cy="15" r="8" fill="#FFFFFF"/>
        <rect x="12" y="22" width="16" height="12" rx="6" fill="#FFFFFF"/>
    </svg>`,
    
    BOX_ON_TARGET: `<svg viewBox="0 0 40 40">
        <rect width="40" height="40" rx="4" fill="#4CAF50"/>
        <rect x="4" y="4" width="32" height="32" rx="2" fill="#388E3C"/>
        <circle cx="20" cy="20" r="8" fill="#FFF"/>
    </svg>`
}; 