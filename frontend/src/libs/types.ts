export type Coord = { x: number; y: number };

export type Confirmable = React.ComponentType<{
    confirm: (Template: React.FC) => Promise<boolean>;
    confirmInPlace: (event: MouseEvent, Template: React.FC) => Promise<boolean>;
}>;

export type Project = {
    color?: string;
    title: string;
};
