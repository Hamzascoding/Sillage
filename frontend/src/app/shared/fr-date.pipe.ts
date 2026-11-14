import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'frDate', standalone: true })
export class FrDatePipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '';
    const date = new Date(value.length === 10 ? `${value}T12:00:00` : value);
    return Number.isNaN(date.getTime())
      ? ''
      : date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  }
}
