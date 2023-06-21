import { isAxiosError } from 'axios';

class HttpStatus {
  static isError(error: any, code: number) {
    return isAxiosError(error) && error.response?.status === code;
  }
}

export default HttpStatus;
