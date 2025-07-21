export interface IBGEState {
  id: number;
  sigla: string;
  nome: string;
  regiao: {
    id: number;
    sigla: string;
    nome: string;
  };
}

export interface IBGECity {
  id: number;
  nome: string;
  microregiao: {
    id: number;
    nome: string;
    mesoregiao: {
      id: number;
      sigla: string;
      nome: string;
      regiao: {
        id: number;
        sigla: string;
        nome: string;
      };
    };
  };
}
