import { AbstractControl, ValidatorFn, FormArray } from '@angular/forms';

/**
  * @author Fabian Duran
  * @createdate 2024-04-12
  * Validacion que permite contar el peso maximo de archivos subidos sobre el campo.
  * @param control Campo tipo file.
*/
export const validateSizeFiles: ValidatorFn = (control: AbstractControl): { [key: string]: boolean } | null => {
  if (!control || !control.value || !(control instanceof FormArray)) return null;
  const maxSizeInBytes = 25 * 1024 * 1024;
  const sizeFile = control.value.reduce((totalSize: number, item: any) => {
    if (item && item.file && item.file.size) return totalSize + item.file.size;
    return totalSize;
  }, 0);
  if (sizeFile > maxSizeInBytes) return { validateSizeFiles: true };
  return null;
};