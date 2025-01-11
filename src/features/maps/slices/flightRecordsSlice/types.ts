export interface FlightRecord {
    id: string;
    date: Date;
    origin: {
        latitude: number;
        longitude: number;
        name: string;
    };
    destination: {
        latitude: number;
        longitude: number;
        name: string;
    };
}
