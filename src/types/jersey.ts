export interface Jersey {
    id: string;
    name: string;
    description: string;
    color: string;
    frontImage?: string;
    backImage?: string;
}

export interface JerseySelection {
    jersey: Jersey;
    playerName?: string;
    opinion?: string;
}
