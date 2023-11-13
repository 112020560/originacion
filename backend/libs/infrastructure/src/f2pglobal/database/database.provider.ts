/* eslint-disable prettier/prettier */
import { DataSource } from 'typeorm';
import { entities } from '../entities';

export const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    useFactory: async () => {
      const dataSource = new DataSource({
        type: 'mssql',
        //url: 'data source=10.173.216.12\\SQLUAT003;User ID=secSocMxsys;Password=Abc..123;Connection Timeout=30;Pooling=true;Initial Catalog=F2P_GLOBAL;Application Name=Originacion;Encrypt=False;TrustServerCertificate=False',
        host: '10.173.216.12\\SQLUAT003',
        //port: 1433,
        username: 'secSocMxsys',
        password: 'Abc..123',
        database: 'F2P_GLOBAL',
        //connectionTimeout: 30,
        entities: [...entities],
        synchronize: false,
        logging: true,
        logger:'advanced-console',
        pool: {
          max: 10,
          min: 0,
          idleTimeoutMillis: 30000
        },
        options:
        {
          instanceName: "SQLUAT003",
          trustServerCertificate: true,
          appName: 'originacion-mx'
        }
      });

      return dataSource.initialize();
    },
  },
];
