import { pool } from "./mysql-connection.js";
import { GraphQLJSON } from 'graphql-type-json';


export const resolvers = {
    Query: {
        account: async (_, { email, password }) => {
            const [rows] = await pool.query('SELECT * FROM accounts WHERE email = ? AND password = ?', [email, password]);
            return rows;
        }
    },

    JSON: GraphQLJSON,

    Mutation: {
        createAccount: async (_, { first_name, last_name, email, password }) => {
            const [result] = await pool.query('INSERT INTO accounts (first_name, last_name, email, password) VALUES (?, ?, ?, ?)', [first_name, last_name, email, password]);
            const [rows] = await pool.query('SELECT * FROM accounts WHERE account_id = ?', [result.insertId]);
            return rows[0];
        },
        createProject: async (_, { account_id, name }) => {
            const [result] = await pool.query('INSERT INTO projects (account_id, name) VALUES (?, ?)', [account_id, name]);
            const [rows] = await pool.query('SELECT * FROM projects WHERE project_id = ?', [result.insertId]);
            await pool.query(`CREATE DATABASE project${result.insertId}`);
            return rows[0];
        },
        createTable: async (_, { project_id, tableName, columns }) => {
            const dbName = `project${project_id}`;

            const columnDefs = columns.map(col => {
                const nullStr = col.Null === 'NO' ? 'NOT NULL' : 'NULL';
                const defaultStr = col.Default !== null && col.Default !== '' ? `DEFAULT '${col.Default}'` : '';
                const extraStr = col.Extra || '';
                const keyStr = col.Key === 'PRI' ? 'PRIMARY KEY' : col.Key === 'UNI' ? 'UNIQUE' : '';
                return `\`${col.Field}\` ${col.Type} ${nullStr} ${defaultStr} ${extraStr} ${keyStr}`.trim();
            }).join(', ');

            const query = `CREATE TABLE \`${dbName}\`.\`${tableName}\` (${columnDefs})`;

            await pool.query(query);
            return `Table '${tableName}' created in ${dbName}`;
        },
        insertRow: async (_, { project_id, tableName, row }) => {
            const dbName = `project${project_id}`;
            const keys = Object.keys(row).map(k => `\`${k}\``).join(', ');
            const values = Object.values(row);
            const placeholders = values.map(() => '?').join(', ');

            const query = `INSERT INTO \`${dbName}\`.\`${tableName}\` (${keys}) VALUES (${placeholders})`;
            await pool.query(query, values);

            return `Inserted into ${tableName} successfully`;
        },
        deleteRow: async (_, { project_id, tableName, condition }) => {
        const dbName = `project${project_id}`;
        const whereClause = Object.entries(condition)
            .map(([key, val]) => `\`${key}\` = ?`).join(' AND ');
        const values = Object.values(condition);
        const query = `DELETE FROM \`${dbName}\`.\`${tableName}\` WHERE ${whereClause}`;
        await pool.query(query, values);
        return `Row deleted from ${tableName}`;
        },

        updateRow: async (_, { project_id, tableName, condition, newData }) => {
        const dbName = `project${project_id}`;
        const setClause = Object.entries(newData)
            .map(([key]) => `\`${key}\` = ?`).join(', ');
        const setValues = Object.values(newData);
        const whereClause = Object.entries(condition)
            .map(([key]) => `\`${key}\` = ?`).join(' AND ');
        const whereValues = Object.values(condition);
        const query = `UPDATE \`${dbName}\`.\`${tableName}\` SET ${setClause} WHERE ${whereClause}`;
        await pool.query(query, [...setValues, ...whereValues]);
        return `Row updated in ${tableName}`;
        },

        addColumn: async (_, { project_id, tableName, column }) => {
        const dbName = `project${project_id}`;
        const nullStr = column.Null === 'NO' ? 'NOT NULL' : 'NULL';
        const defaultStr = column.Default !== null && column.Default !== '' ? `DEFAULT '${column.Default}'` : '';
        const extraStr = column.Extra || '';
        const keyStr = column.Key === 'PRI' ? 'PRIMARY KEY' : column.Key === 'UNI' ? 'UNIQUE' : '';

        const colDef = `\`${column.Field}\` ${column.Type} ${nullStr} ${defaultStr} ${extraStr} ${keyStr}`.trim();
        const query = `ALTER TABLE \`${dbName}\`.\`${tableName}\` ADD COLUMN ${colDef}`;
        await pool.query(query);
        return `Column ${column.Field} added to ${tableName}`;
        },

        deleteColumn: async (_, { project_id, tableName, columnName }) => {
        const dbName = `project${project_id}`;
        const query = `ALTER TABLE \`${dbName}\`.\`${tableName}\` DROP COLUMN \`${columnName}\``;
        await pool.query(query);
        return `Column ${columnName} deleted from ${tableName}`;
        },

        updateColumn: async (_, { project_id, tableName, columnName, newColumn }) => {
        const dbName = `project${project_id}`;
        const nullStr = newColumn.Null === 'NO' ? 'NOT NULL' : 'NULL';
        const defaultStr = newColumn.Default !== null && newColumn.Default !== '' ? `DEFAULT '${newColumn.Default}'` : '';
        const extraStr = newColumn.Extra || '';
        const keyStr = newColumn.Key === 'PRI' ? 'PRIMARY KEY' : newColumn.Key === 'UNI' ? 'UNIQUE' : '';

        const colDef = `\`${newColumn.Field}\` ${newColumn.Type} ${nullStr} ${defaultStr} ${extraStr} ${keyStr}`.trim();
        const query = `ALTER TABLE \`${dbName}\`.\`${tableName}\` CHANGE \`${columnName}\` ${colDef}`;
        await pool.query(query);
        return `Column ${columnName} updated in ${tableName}`;
        }

    },
    Account: {
        projects: async (parent) => {
            const [rows] = await pool.query('SELECT * FROM projects WHERE account_id = ?', [parent.account_id]);
            return rows;
        }
    },
    Project: {
        tables: async (parent) => {
            const databsename = `project${parent.project_id}`;
            const [tableRows] = await pool.query(`SHOW TABLES FROM \`${databsename}\``);
            const tables = await Promise.all(
                tableRows.map(async (row) => {
                    return {
                        project_id:parent.project_id,
                        name: Object.values(row)[0]
                    };
                })
            );
            return tables;
        }
    },
    Table: {
        header: async (parent) => {
            const [headerRows] = await pool.query(`DESCRIBE \`project${parent.project_id}\`.\`${parent.name}\``);   
            return headerRows;
        },
        row: async (parent) => { 
            const [dataRows] = await pool.query(`SELECT * FROM \`project${parent.project_id}\`.\`${parent.name}\``);
            return dataRows;
        }
    }
};
