import { Sequelize } from 'sequelize';



const sequelize = new Sequelize('type', 'jairo', 'intell01', {
  dialect: 'mysql',
  host: 'jscloud.com.br',
  logging: false,
});

export default sequelize;
