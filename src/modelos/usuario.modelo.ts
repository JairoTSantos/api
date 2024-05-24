import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import UsuarioNivel from './usuarioNivel.modelo';

interface UsuarioAttributes {
    usuario_id: number;
    usuario_nome: string;
    usuario_email: string;
    usuario_aniversario: Date;
    usuario_senha: string;
    usuario_telefone: string;
    usuario_nivel: number;
    usuario_ativo: boolean;
    usuario_token: string;
}

class Usuario extends Model<UsuarioAttributes> implements UsuarioAttributes {
    public usuario_id!: number;
    public usuario_nome!: string;
    public usuario_email!: string;
    public usuario_aniversario!: Date;
    public usuario_senha!: string;
    public usuario_telefone!: string;
    public usuario_nivel!: number;
    public usuario_ativo!: boolean;
    public usuario_token!: string;
}

Usuario.init(
    {
        usuario_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        usuario_nome: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        usuario_email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        usuario_aniversario: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        usuario_senha: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        usuario_telefone: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        usuario_nivel: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: UsuarioNivel,
                key: 'usuario_nivel_id'
            }
        },
        usuario_ativo: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        usuario_token: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        sequelize,
        modelName: 'Usuario',
        tableName: 'usuario',
        timestamps: true,
        createdAt: 'usuario_criado_em',
        updatedAt: 'usuario_atualizado_em',
    }
);

Usuario.belongsTo(UsuarioNivel, {
    foreignKey: 'usuario_nivel',
    targetKey: 'usuario_nivel_id',
    onDelete: 'RESTRICT',
    onUpdate: 'NO ACTION',
    as: 'nivel'
});

export default Usuario;