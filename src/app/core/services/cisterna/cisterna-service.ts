import { Service } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Service()
export class CisternaService {
    private readonly API_URL=`${environment.apiUrl}/api/v1/cisterna}`;
    
}
