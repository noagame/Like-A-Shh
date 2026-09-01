export abstract class Actividad {
  constructor(
    protected readonly id: string,
    protected readonly title: string,
    protected readonly startTime: string,
    protected readonly endTime: string,
    protected readonly capacity: number | null,
    protected readonly status: "draft" | "published" | "cancelled"
  ) {}

  public estaDisponible(): boolean {
    return this.status === "published" && !this.finalizada() && !this.cupoLleno();
  }

  public finalizada(): boolean {
    return new Date(this.endTime).getTime() < Date.now();
  }

  public cupoLleno(asistentes: number = 0): boolean {
    if (this.capacity === null || this.capacity === undefined) {
      return false;
    }

    return asistentes >= this.capacity;
  }

  public getTitle(): string {
    return this.title;
  }

  public getStartTime(): string {
    return this.startTime;
  }

  public getEndTime(): string {
    return this.endTime;
  }
}

export class ClasePresencial extends Actividad {
  constructor(
    id: string,
    title: string,
    startTime: string,
    endTime: string,
    capacity: number | null,
    status: "draft" | "published" | "cancelled",
    private readonly location: string
  ) {
    super(id, title, startTime, endTime, capacity, status);
  }

  public getLocation(): string {
    return this.location;
  }
}

export class ClaseOnline extends Actividad {
  constructor(
    id: string,
    title: string,
    startTime: string,
    endTime: string,
    capacity: number | null,
    status: "draft" | "published" | "cancelled",
    private readonly meetingUrl: string
  ) {
    super(id, title, startTime, endTime, capacity, status);
  }

  public getMeetingUrl(): string {
    return this.meetingUrl;
  }
}

export class EventoMasivo extends Actividad {
  constructor(
    id: string,
    title: string,
    startTime: string,
    endTime: string,
    capacity: number | null,
    status: "draft" | "published" | "cancelled",
    private readonly location: string | null,
    private readonly category: string | null
  ) {
    super(id, title, startTime, endTime, capacity, status);
  }

  public getLocation(): string | null {
    return this.location;
  }

  public getCategory(): string | null {
    return this.category;
  }
}
