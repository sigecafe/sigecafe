declare module 'datatables.net-plugins/i18n/pt-BR.mjs';

// Add declaration for datatables.net
declare module 'datatables.net' {
  export interface Config {
    dom?: string;
    searching?: boolean;
    language?: any;
    paging?: boolean;
    ordering?: boolean;
    responsive?: boolean;
    autoWidth?: boolean;
    select?: {
      style?: string;
    };
    buttons?: any[];
    [key: string]: any;
  }

  export interface ConfigColumns {
    data: string | null;
    title: string;
    className?: string;
    searchable?: boolean;
    orderable?: boolean;
    name?: string;
    render?: string | Function;
    responsivePriority?: number;
    defaultContent?: string;
    [key: string]: any;
  }
}