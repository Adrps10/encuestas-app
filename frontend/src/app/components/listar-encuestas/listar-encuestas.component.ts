import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EncuestaService } from '../../services/encuesta.service';
import { Encuesta } from '../../models/encuesta.model';
import { NotificationService } from '../../services/notification.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-listar-encuestas',
  templateUrl: './listar-encuestas.component.html',
  styleUrls: ['./listar-encuestas.component.css']
})
export class ListarEncuestasComponent implements OnInit {
  encuestas: Encuesta[] = [];
  encuestasFiltradas: Encuesta[] = [];
  marcas: any[] = [];
  loading: boolean = true;
  error: string = '';

  filtroTexto: string = '';
  filtroMarca: string = '';
  filtroEstado: string = '';

  mostrarDetalles: boolean = false;
  mostrarPlantilla: boolean = false;
  encuestaSeleccionada: Encuesta | null = null;
  plantillaActual: string = '';
  imagenUrl: string = '';

  imagenesMarca: { [key: string]: string } = {
    'Subaru': 'assets/whatsapp/subaruPachuca.png',
    'Toyota Pachuca': 'assets/whatsapp/toyotaPachuca.jpeg',
    'Toyota Tulancingo': 'assets/whatsapp/toyotaTulancingo.jpeg',
    'Carsline Pachuca': 'assets/whatsapp/carsline.png',
    'Carsline Queretaro': 'assets/whatsapp/carsline.png',
    'Carsline Querétaro': 'assets/whatsapp/carsline.png',
    'GMW': 'assets/whatsapp/comproCars.png',
    'GWM Queretaro': 'assets/whatsapp/comproCars.png',
    'GWM Querétaro': 'assets/whatsapp/comproCars.png',
    'CompraCars Pachuca': 'assets/whatsapp/comproCars.png',
    'CompraCars Querétaro': 'assets/whatsapp/comproCars.png',
    'ComproCars Queretaro': 'assets/whatsapp/comproCars.png',
    'ComproCars Querétaro': 'assets/whatsapp/comproCars.png',
    'Compro Pachuca': 'assets/whatsapp/comproCars.png'
  };

  emojis = {
    manosArriba: '🙌🏽',
    auto: '🚗',
    herramienta: '🧰',
    gracias: '☺️',
    bienvenida: '🙌🏽',
    punto: '👉'
  };

  constructor(
    private encuestaService: EncuestaService,
    private router: Router,
    private notificationService: NotificationService
  ) {
    this.marcas = this.encuestaService.obtenerMarcas();
  }

  ngOnInit() {
    this.cargarEncuestas();
  }

  cargarEncuestas() {
    this.loading = true;
    this.encuestaService.listarEncuestas().subscribe({
      next: (data: Encuesta[]) => {
        this.encuestas = data;
        this.encuestasFiltradas = data;
        this.loading = false;
      },
      error: (error: any) => {
        this.error = 'Error al cargar las encuestas';
        this.loading = false;
        console.error('Error:', error);
      }
    });
  }

  filtrarEncuestas() {
    this.encuestasFiltradas = this.encuestas.filter(encuesta => {
      const textoMatch = this.filtroTexto === '' ||
        encuesta.clienteNombre.toLowerCase().includes(this.filtroTexto.toLowerCase()) ||
        encuesta.clienteEmail.toLowerCase().includes(this.filtroTexto.toLowerCase());

      const marcaMatch = this.filtroMarca === '' ||
        encuesta.marcaNombre === this.filtroMarca;

      const estadoMatch = this.filtroEstado === '' ||
        encuesta.estado === this.filtroEstado;

      return textoMatch && marcaMatch && estadoMatch;
    });
  }

  limpiarFiltros() {
    this.filtroTexto = '';
    this.filtroMarca = '';
    this.filtroEstado = '';
    this.encuestasFiltradas = this.encuestas;
  }

  obtenerImagenMarca(nombreMarca: string): string {
    if (!nombreMarca) return 'assets/whatsapp/subaruPachuca.png';
    
    if (this.imagenesMarca[nombreMarca]) {
      return this.imagenesMarca[nombreMarca];
    }
    
    for (const key of Object.keys(this.imagenesMarca)) {
      if (nombreMarca.toLowerCase().includes(key.toLowerCase()) || 
          key.toLowerCase().includes(nombreMarca.toLowerCase())) {
        return this.imagenesMarca[key];
      }
    }
    
    return 'assets/whatsapp/subaruPachuca.png';
  }

  // ✅ CORREGIDO: URL base para Vercel
  obtenerUrlImagen(marcaNombre: string): string {
    const imagenPath = this.obtenerImagenMarca(marcaNombre);
    const baseUrl = 'https://encuestas-app.vercel.app';
    return baseUrl + '/' + imagenPath;
  }

  formatearFecha(fechaStr: string): string {
    if (!fechaStr) return 'fecha de visita';
    const fecha = new Date(fechaStr);
    if (!isNaN(fecha.getTime())) {
      return fecha.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    return fechaStr || 'fecha de visita';
  }

  // ✅ CORREGIDO: Plantilla sin URL de imagen al inicio
  generarPlantilla(encuesta: Encuesta): string {
    const nombreCliente = encuesta.clienteNombre || 'Cliente';
    const nombreMarca = encuesta.marcaNombre || 'Subaru';
    const link = this.generarLink(encuesta.token);
    
    let asesor = 'Asesor de Servicio';
    let modeloAuto = 'su vehiculo';
    let fechaVisita = 'fecha de visita';
    let tipoEncuesta = 'POSTVENTA';

    if (encuesta.respuestas && encuesta.respuestas.length > 0) {
      for (const respuesta of encuesta.respuestas) {
        if (respuesta.preguntaTexto && respuesta.preguntaTexto.includes('Nombre')) {
          // Ya tenemos el nombre del cliente
        }
      }
    }

    let plantilla = '';

    if (tipoEncuesta === 'VENTA') {
      plantilla += 'Buen dia, Sr./Srita. *' + nombreCliente + '*.\n';
      plantilla += 'Mi nombre es *' + asesor + '* y formo parte del area de Satisfaccion a Clientes de *' + nombreMarca + '* ' + this.emojis.manosArriba + '.\n';
      plantilla += 'Agradecemos sinceramente el tiempo que nos brindo al visitarnos. Fue un placer atenderle y acompanarle durante la adquisicion de su *' + modeloAuto + '*.\n';
      plantilla += 'Nos gustaria conocer su opinion sobre la atencion recibida tanto por parte de nuestra agencia como de su asesor *' + asesor + '*. Por ello, le invitamos a responder nuestra encuesta de satisfaccion, la cual le tomara solo unos minutos.\n';
      plantilla += 'Para participar, por favor haga clic en el siguiente enlace:\n';
      plantilla += this.emojis.punto + ' ' + link + '\n';
      plantilla += 'Muchas gracias por su tiempo y confianza.\n';
      plantilla += '¡Le damos la mas cordial bienvenida a la familia *' + nombreMarca + '*! ' + this.emojis.bienvenida + ' ' + this.emojis.auto;
    } else {
      plantilla += 'Buen dia, Sr./Srita. *' + nombreCliente + '*.\n';
      plantilla += 'Mi nombre es *' + asesor + '* de Satisfaccion a Clientes de *' + nombreMarca + '* ' + this.emojis.manosArriba + '.\n';
      plantilla += 'Agradecemos sinceramente el tiempo que nos brindo al visitarnos en nuestra agencia, fue un gusto atenderle y acompanarle durante su estancia.\n';
      plantilla += 'Nos gustaria conocer su opinion respecto al servicio realizado a su *' + modeloAuto + '* el dia *' + fechaVisita + '* ' + this.emojis.auto + this.emojis.herramienta + '.\n';
      plantilla += 'Lo invitamos a responder nuestra encuesta de satisfaccion; le tomara solo unos minutos.\n\n';
      plantilla += 'Por favor, haz clic en el siguiente enlace para participar:\n';
      plantilla += this.emojis.punto + ' ' + link + '\n';
      plantilla += '¡Muchas gracias por su tiempo! ' + this.emojis.gracias + ' ' + this.emojis.auto;
    }

    return plantilla;
  }

  verPlantilla(encuesta: Encuesta) {
    this.encuestaSeleccionada = encuesta;
    this.plantillaActual = this.generarPlantilla(encuesta);
    this.imagenUrl = this.obtenerUrlImagen(encuesta.marcaNombre || 'Subaru');
    this.mostrarPlantilla = true;
  }

  cerrarPlantilla() {
    this.mostrarPlantilla = false;
    this.plantillaActual = '';
    this.encuestaSeleccionada = null;
  }

  copiarPlantilla(plantilla: string) {
    navigator.clipboard.writeText(plantilla);
    this.notificationService.show('Plantilla copiada al portapapeles', 'success');
  }

  eliminarEncuesta(encuesta: Encuesta) {
    if (!encuesta.id) {
      this.notificationService.show('No se puede eliminar: ID no encontrado', 'error');
      return;
    }

    if (confirm('¿Estas seguro de eliminar la encuesta de ' + encuesta.clienteNombre + '? Esta accion no se puede deshacer.')) {
      this.encuestaService.eliminarEncuesta(encuesta.id).subscribe({
        next: () => {
          this.notificationService.show('Encuesta de ' + encuesta.clienteNombre + ' eliminada correctamente', 'success');
          this.cargarEncuestas();
        },
        error: (error) => {
          console.error('Error al eliminar:', error);
          this.notificationService.show('Error al eliminar la encuesta', 'error');
        }
      });
    }
  }

  exportarExcel() {
    if (this.encuestasFiltradas.length === 0) {
      this.notificationService.show('No hay encuestas para exportar', 'warning');
      return;
    }

    const data = this.encuestasFiltradas.map(e => ({
      'Cliente': e.clienteNombre,
      'Email': e.clienteEmail,
      'Marca': e.marcaNombre,
      'Estado': this.getEstadoTexto(e.estado),
      'Fecha Envio': e.fechaEnvio ? new Date(e.fechaEnvio).toLocaleString('es-MX') : '',
      'Fecha Respuesta': e.fechaRespuesta ? new Date(e.fechaRespuesta).toLocaleString('es-MX') : '',
      'Token': e.token,
      'Link': this.generarLink(e.token)
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Encuestas');
    
    const colWidths = [
      { wch: 35 },
      { wch: 30 },
      { wch: 25 },
      { wch: 12 },
      { wch: 20 },
      { wch: 20 },
      { wch: 40 },
      { wch: 50 }
    ];
    ws['!cols'] = colWidths;

    const fileName = 'encuestas_' + new Date().toISOString().split('T')[0] + '.xlsx';
    XLSX.writeFile(wb, fileName);
    
    this.notificationService.show('Encuestas exportadas correctamente', 'success');
  }

  getEstadoClass(estado: string): string {
    const classes: { [key: string]: string } = {
      'ENVIADA': 'badge-enviada',
      'RESPONDIDA': 'badge-respondida',
      'EXPIRADA': 'badge-expirada'
    };
    return classes[estado] || '';
  }

  getEstadoTexto(estado: string): string {
    const textos: { [key: string]: string } = {
      'ENVIADA': 'Enviada',
      'RESPONDIDA': 'Respondida',
      'EXPIRADA': 'Expirada'
    };
    return textos[estado] || estado;
  }

  formatFecha(fecha: Date | string): string {
    if (!fecha) return '-';
    const d = new Date(fecha);
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const anio = d.getFullYear();
    const horas = String(d.getHours()).padStart(2, '0');
    const minutos = String(d.getMinutes()).padStart(2, '0');
    return dia + '/' + mes + '/' + anio + ' ' + horas + ':' + minutos;
  }

  generarLink(token: string): string {
    return this.encuestaService.generarLinkEncuesta(token);
  }

  copiarLink(token: string, clienteNombre: string) {
    const link = this.generarLink(token);
    navigator.clipboard.writeText(link).then(() => {
      this.notificationService.show('Link copiado para ' + clienteNombre, 'success');
    }).catch(() => {
      prompt('Copia el link para ' + clienteNombre + ':', link);
    });
  }

  verDetalles(encuesta: Encuesta) {
    this.encuestaSeleccionada = encuesta;
    this.mostrarDetalles = true;
  }

  cerrarDetalles() {
    this.mostrarDetalles = false;
    this.encuestaSeleccionada = null;
  }
}