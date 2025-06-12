
export const typeDefs = `#graphql
  type Account {
    account_id: ID!
    first_name: String!
    last_name: String!
    email: String!
    password: String!
    projects: [Project!]!
  }


  type Project {
    project_id: ID!
    account_id: ID!
    name: String!
    tables: [Table!]!
  }

   scalar JSON

    type Table {
    project_id: ID!
    name: String!
    header: [Column!]!
    row: [JSON!]!
    }

    type Column {
    Field: String!
    Type: String!
    Null: String!
    Key: String!
    Default: String
    Extra: String!
    }

    input ColumnInput {
    Field: String!
    Type: String!
    Null: String!
    Key: String
    Default: String
    Extra: String
    }

   type Query {
    account(email: String!, password: String!): [Account!]!
  }

  type Mutation {
    createAccount( first_name: String!, last_name: String!,email: String!, password: String!): Account!
    createProject( account_id: ID!, name: String!): Project!
    createTable(project_id: ID!, tableName: String!, columns: [ColumnInput!]!): String!
    insertRow(project_id: ID!, tableName: String!, row: JSON!): String!
    deleteRow(project_id: ID!, tableName: String!, condition: JSON!): String!
    updateRow(project_id: ID!, tableName: String!, condition: JSON!, newData: JSON!): String!
    addColumn(project_id: ID!, tableName: String!, column: ColumnInput!): String!
    deleteColumn(project_id: ID!, tableName: String!, columnName: String!): String!
    updateColumn(project_id: ID!, tableName: String!, columnName: String!, newColumn: ColumnInput!): String!
  }
`;
