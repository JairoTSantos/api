import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import Usuario from './usuario.modelo';

interface NotaTecnicaAttributes {
    nota_id: number;
    nota_proposicao: number;
    nota_titulo: string;
    nota_apelido: string;
    nota_texto: string;
    nota_criada_por: number;
}

class NotaTecnica extends Model<NotaTecnicaAttributes> implements NotaTecnicaAttributes {
    public nota_id!: number;
    public nota_proposicao!: number;
    public nota_titulo!: string;
    public nota_apelido!: string;
    public nota_texto!: string;
    public nota_criada_por!: number;
}

NotaTecnica.init(
    {
        nota_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        nota_proposicao: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true
        },
        nota_titulo: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        nota_apelido: {
            type: DataTypes.STRING,
            allowNull: false
        },
        nota_texto: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        nota_criada_por: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Usuario,
                key: 'usuario_id',
            },
        },
    },
    {
        sequelize,
        modelName: 'NotaTecnica',
        tableName: 'nota_tecnica',
        timestamps: true,
        createdAt: 'nota_criada_em',
        updatedAt: 'nota_atualizada_em',
    }
);

NotaTecnica.belongsTo(Usuario, {
    foreignKey: 'nota_criada_por',
    targetKey: 'usuario_id',
    onDelete: 'RESTRICT',
    onUpdate: 'NO ACTION',
    as: 'nota_criado_por',
});

export default NotaTecnica;
