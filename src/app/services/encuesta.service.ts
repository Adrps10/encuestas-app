import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { 
  Encuesta, 
  EncuestaRequestDTO, 
  EstadisticasGenerales,
  Pregunta,
  MarcaEncuesta,
  DashboardStats
} from '../models/encuesta.model';

@Injectable({
  providedIn: 'root'
})
export class EncuestaService {
  private apiUrl = 'http://localhost:8086/api/encuestas';
  private frontendUrl = 'http://localhost:4200';

  // Datos de marcas (hardcodeados para el frontend)
  marcas = [
    { id: 1, nombre: 'Toyota Pachuca' },
    { id: 2, nombre: 'Carsline Pachuca' },
    { id: 3, nombre: 'Carsline Querétaro' },
    { id: 4, nombre: 'GWM Querétaro' },
    { id: 5, nombre: 'Subaru' },
    { id: 6, nombre: 'ComproCars Querétaro' },
    { id: 7, nombre: 'ComproCars Pachuca' }
  ];

  // Preguntas predefinidas
  preguntas: Pregunta[] = [
    {
      id: 1,
      texto: '¿Cómo evaluaría su experiencia con la agencia?',
      tipo: 'ESCALA',
      obligatoria: true,
      orden: 1
    },
    {
      id: 2,
      texto: '¿Cómo calificaría su experiencia con el asesor de servicio (conocimiento, cortesía, comunicación)?',
      tipo: 'ESCALA',
      obligatoria: true,
      orden: 2
    },
    {
      id: 3,
      texto: '¿Recomendaría nuestro servicio?',
      tipo: 'SI_NO',
      obligatoria: true,
      orden: 3,
      opciones: [
        { id: 1, texto: 'SI', valor: 'SI' },
        { id: 2, texto: 'NO', valor: 'NO' }
      ]
    },
    {
      id: 4,
      texto: '¿Algo que podamos mejorar durante su estancia?',
      tipo: 'TEXTO',
      obligatoria: false,
      orden: 4
    }
  ];

  constructor(private http: HttpClient) {}

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ocurrió un error en el servidor';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Código: ${error.status}, Mensaje: ${error.message}`;
    }
    console.error('Error en el servicio:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  obtenerPreguntas(): Pregunta[] {
    return this.preguntas;
  }

  obtenerMarcas(): any[] {
    return this.marcas;
  }

  obtenerMarcaPorId(id: number): string {
    const marca = this.marcas.find(m => m.id === id);
    return marca ? marca.nombre : 'Desconocida';
  }

  // Crear encuesta
  crearEncuesta(data: EncuestaRequestDTO): Observable<Encuesta> {
    return this.http.post<Encuesta>(`${this.apiUrl}/crear`, data)
      .pipe(catchError(this.handleError));
  }

  // Obtener encuesta por token
  obtenerEncuestaPorToken(token: string): Observable<Encuesta> {
    return this.http.get<Encuesta>(`${this.apiUrl}/token/${token}`)
      .pipe(catchError(this.handleError));
  }

  // Responder encuesta
  responderEncuesta(token: string, data: EncuestaRequestDTO): Observable<Encuesta> {
    return this.http.post<Encuesta>(`${this.apiUrl}/responder/${token}`, data)
      .pipe(catchError(this.handleError));
  }

  // Listar todas las encuestas
  listarEncuestas(): Observable<Encuesta[]> {
    return this.http.get<Encuesta[]>(`${this.apiUrl}/listar`)
      .pipe(catchError(this.handleError));
  }

  // Listar encuestas por marca
  listarEncuestasPorMarca(marcaId: number): Observable<Encuesta[]> {
    return this.http.get<Encuesta[]>(`${this.apiUrl}/marca/${marcaId}`)
      .pipe(catchError(this.handleError));
  }

  // Obtener estadísticas generales
  obtenerEstadisticasGenerales(): Observable<EstadisticasGenerales> {
    return this.http.get<EstadisticasGenerales>(`${this.apiUrl}/estadisticas/generales`)
      .pipe(catchError(this.handleError));
  }

  // Obtener estadísticas por marca
  obtenerEstadisticasPorMarca(marcaId: number): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/dashboard/marca/${marcaId}`)
      .pipe(catchError(this.handleError));
  }

  // Obtener estadísticas completas
  obtenerEstadisticasCompletas(): Observable<DashboardStats[]> {
    return this.http.get<DashboardStats[]>(`${this.apiUrl}/dashboard/completo`)
      .pipe(catchError(this.handleError));
  }

  // Generar link para compartir
  generarLinkEncuesta(token: string): string {
    return `${this.frontendUrl}/responder/${token}`;
  }

  // Enviar link por email
  enviarLinkEmail(token: string, email: string): Observable<any> {
    const link = this.generarLinkEncuesta(token);
    return this.http.post(`${this.apiUrl}/enviar-link`, { token, email, link })
      .pipe(catchError(this.handleError));
  }
}