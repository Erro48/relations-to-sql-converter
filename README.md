# relations-to-sql-parser
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)

JS module which converts a file containing db relations into a sql file with CREATE TABLE queries.

Table of Contents
=================
* [Usage](#usage)

Usage
=================
This module takes as input a file formatted like below:
```
RelationName(PK:(PrimaryKey), Attribute1, Attribute2*, Table2: ForeignKey) Unique(Attribute1)
```

TODO
=================
- parlare di come deve essere formattata una riga (spazi, parentesi, ecc)
- parlare dell'ordine delle tabelle
- parlare delle opzioni per il tipo e per la creazione del database
- parlare del fatto che il nome del file .sql è lo stesso del nome del file .txt
- spiegare come scrivere una relazione
  - primary key: tra parentesi e al primo posto
  - foreign key: con due punti
  - unique: unique innestate e non
  - opzionali
  - ...
