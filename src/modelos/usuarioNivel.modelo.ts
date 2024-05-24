import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

interface UsuarioNivelAttributes {
    usuario_nivel_id: number;
    usuario_nivel_nome: string;
}

class UsuarioNivel extends Model<UsuarioNivelAttributes> implements UsuarioNivelAttributes {
    public usuario_nivel_id!: number;
    public usuario_nivel_nome!: string;
}

UsuarioNivel.init(
    {
        usuario_nivel_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        usuario_nivel_nome: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: 'UsuarioNivel',
        tableName: 'usuario_nivel',
        timestamps: true,
        createdAt: 'usuario_nivel_criado_em',
        updatedAt: 'usuario_nivel_atualizado_em',
    }
);

export default UsuarioNivel;