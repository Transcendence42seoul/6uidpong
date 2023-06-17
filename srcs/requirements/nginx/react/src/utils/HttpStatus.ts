import { HttpStatusCode, isAxiosError } from 'axios';

class HttpStatus {
  static isConflict(error: any) {
    return (
      isAxiosError(error) && error.response?.status === HttpStatusCode.Conflict
    );
  }
}

export default HttpStatus;
