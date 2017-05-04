const MySQLHelper = require('./mysql.helper');

const GeneratedHelper = {
    searchForGeneratedColumns (connection, database, tableName) {
        const query = MySQLHelper.generateSelectQuery('`information_schema`.`COLUMNS`', ['COLUMN_NAME', 'EXTRA'], {
            TABLE_SCHEMA: database,
            TABLE_NAME: tableName,
            $or: [{
                EXTRA: {
                    $like: '%GENERATED%'
                }
            }, {
                EXTRA: {
                    $like: '%VIRTUAL%'
                }
            }]
        });
        return connection.query(query).then(data => data[0]).then(this.createGeneratedKV);
    },

    createGeneratedKV (data) {
        const generatedKV = {};

        for (const element of data) {
            generatedKV[element.COLUMN_NAME] = true;
        }

        return generatedKV;
    },

    renderQueryResultWithGeneratedColumns (data, generatedColumns) {
        const columnsDescription = data[1];

        for (const key in columnsDescription) {
            columnsDescription[key] = columnsDescription[key].inspect();
            const column = columnsDescription[key];

            if (generatedColumns[column.orgName]) {
                column.generated = true;
            }
        }

        return data;
    },
};

module.exports = GeneratedHelper;