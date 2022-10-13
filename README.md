# relations-to-sql-converter
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![MySQL](https://img.shields.io/badge/mysql-%2300f.svg?style=for-the-badge&logo=mysql&logoColor=white)

JS module which converts a file containing db relations into a MySql file with CREATE TABLE queries.

#### Table of Contents
- [Usage](#usage)
- [Inputs](#inputs)
  * [Input file](#input-file)
    + [Relation Name](#relation-name)
    + [Primary Key](#primary-key)
    + [Attributes](#attributes)
    + [Foreign Key](#foreign-key)
    + [Unique](#unique)
  * [DB creation flag](#db-creation-flag)
  * [Type flag](#type-flag)
- [Output File](#output-file)


Usage
================
The method which converts the relational schema into a sql query file is `relationalToSql` in `relationalToSql.js` module. The other two modules are used internally by `relationalToSql.js` module.

Inputs
================
The method takes as input three parameters:
- the file path of the location of the file to convert;
- a flag to specify if the output file has to contain the command to create the database;
- a flag to specify if in the input file are specified the attributes types or not.


## Input file

The input file has to be a text file, formatted like below:

```
RelationName((PrimaryKey), Attribute1, Attribute2*, Table2: ForeignKey) Unique(Attribute1)
```

Where:
- `RelationName` is the name of the relation;
- `PrimaryKey` is the primary key attribute;
- `Attribute1`, <b>Attribute2*</b> are the other attributes of the relation;
- `ForeignKey` is a foreign key, referring to the primary key of the relation <i>Table2</i>.

⚠️**IMPORTANT!**: relations must be ordered, so that a relation first has all the relations it imports foreign keys to.

### Relation Name

Each relation needs to have the name followed by `(`, without any spaces.
The relation name will be the name of the sql table, in the output file.

### Primary Key

The primary key attribute needs to be the first attribute, and needs to be inside parenthesis.
If the relation has a composite primary key, the attributes composing it must to be separated by a `,` and a white space.

```
RelationName((SingleAttributeKey))
RelationName((Multiple, Attribute, Key))
```

### Attributes

The attributes must be separated by a `,` followed by a white space.
To indicate an optional attribute, you need to use an `*` after the attribute name.
To indicate an attribute with AUTO_INCREMENT property, you need to use a `^` after the attribute name. This is valid for primary key too.
All the values used to add propery to the attributes, can be written in any order (i.e. `attribute*^` is the same as `attribute^*`).

### Foreign Key

To indicate a foreign key, you need to specify the relation to which the foreign key refers, then the name of the attribute to use in the current relation, all separated by a `:`. This will automatically match the foreign key to the primary key of the referencing relation.

```
RelationName((PrimaryKey), Relation2: ForeignKey)
```

This syntax works for primary key too.

### Unique

The `Unique` statement is used to indicate if an attribute (or a group of attribute) is unique.
The unique attributes have to be indicated between parenthesis and must be separated by a `,` and a white space. If you want to indicate a group of unique attributes you need to write them in a nested pair of parenthesis.

```
FirstRelation((PrimaryKey), Attribute1, Attribute2, Attribute3) Unique(Attribute1, Attribute2, Attribute3)
SecondRelation((PrimaryKey), Attribute1, Attribute2, Attribute3) Unique((Attribute1, Attribute2), Attribute3)
```

In `FirstRelation` `Attribute1`, `Attribute2` and `Attribute3` are three different unique attributes.
In `SecondRelation` there will be a unique constraint on the pair `Attribute1, Attribute2` and one for `Attribute3`.


## DB creation flag

If this flag is set to `true`, at the beginning of the output file will be set the instructions to create the database.
The database will have the name of the input's file name.

Example with flag set to `true` and input file with name `inputName.txt`
```sql
DROP DATABASE IF EXISTS inputName;

CREATE DATABASE inputName;
USE inputName;

...CREATE TABLE instructions...
```

## Type flag

If this flag is set to `true`, then each attribute must be followed by `>` and the type of the attribute, without any spaces.

```
RelationName((PrimaryKey>int), Attribute1>varchar(10), Attribute2*>date, Table2: ForeignKey>tinyint unsigned) Unique(Attribute1)
```


Output File
==========

The output file will have the same name of the input file, except for the extension that will be `.sql`.
Each relation will be translated in the corresponding MySql CREATE TABLE query.

So, for example, the following relation
```
Table2((Table2PK), Attribute1Table2)
RelationName((PrimaryKey), Attribute1, Attribute2*, Table2: ForeignKey) Unique(Attribute1)
```

will be translated in the following queries

```sql
CREATE TABLE Table2 (
  Table2PK NOT NULL,
  Attribute1Table2 NOT NULL,
  CONSTRAINT PK_Table2PK PRIMARY KEY (Table2PK)
);

CREATE TABLE RelationName (
  PrimaryKey NOT NULL,
  Attribute1 NOT NULL,
  Attribute2,
  ForeignKey NOT NULL,
  CONSTRAINT PK_RelationName PRIMARY KEY (PrimaryKey),
  CONSTRAINT FK_RelationName_ForeignKey FOREIGN KEY (ForeignKey) REFERENCES Table2(Table2PK),
  CONSTRAINT UN_Attribute1 UNIQUE (Attribute1)
);
```
