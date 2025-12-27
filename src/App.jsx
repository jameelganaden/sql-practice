import React, { useState, useEffect } from 'react';
import { Code, Trophy, Zap, BookOpen, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

// Database schemas for context
const schemas = {
  ecommerce: {
    customers: ['customer_id', 'first_name', 'last_name', 'email', 'status', 'signup_date'],
    products: ['product_id', 'product_name', 'category', 'price', 'stock_quantity', 'status'],
    orders: ['order_id', 'customer_id', 'order_date', 'total_amount', 'status', 'shipping_address'],
    order_items: ['item_id', 'order_id', 'product_id', 'quantity', 'unit_price'],
    categories: ['category_id', 'category_name', 'parent_category_id']
  },
  company: {
    employees: ['employee_id', 'first_name', 'last_name', 'email', 'department_id', 'salary', 'hire_date', 'manager_id'],
    departments: ['department_id', 'department_name', 'location', 'budget'],
    projects: ['project_id', 'project_name', 'department_id', 'start_date', 'end_date', 'budget', 'status'],
    assignments: ['assignment_id', 'employee_id', 'project_id', 'role', 'hours_allocated']
  },
  sales: {
    sales: ['sale_id', 'sales_rep_id', 'customer_id', 'sale_date', 'amount', 'region', 'status'],
    sales_reps: ['rep_id', 'rep_name', 'email', 'territory', 'hire_date', 'quota'],
    transactions: ['transaction_id', 'sale_id', 'payment_method', 'transaction_date', 'amount', 'status'],
    regions: ['region_id', 'region_name', 'manager_id', 'target_revenue']
  }
};

// SQL Problem Templates with randomizable variations
const problemTemplates = {
  easy: [
    {
      id: 'select-basic',
      title: 'Select All Active Products',
      schema: 'ecommerce',
      tables: ['products'],
      variants: {
        table: [
          { name: 'products', status: 'active', desc: 'in stock' },
          { name: 'customers', status: 'verified', desc: 'verified' },
          { name: 'orders', status: 'pending', desc: 'pending' },
          { name: 'employees', status: 'active', desc: 'currently employed' },
        ]
      },
      description: 'Select all records from the {table.name} table where status is "{table.status}".',
      contextBuilder: (vars) => {
        const cols = schemas.ecommerce[vars.table.name];
        return {
          tables: [{
            name: vars.table.name,
            columns: cols
          }]
        };
      },
      solution: 'SELECT * FROM {table.name} WHERE status = \'{table.status}\'',
      hint: 'Use SELECT * to get all columns, and WHERE to filter by the status column'
    },
    {
      id: 'count-records',
      title: 'Count Completed Orders',
      schema: 'ecommerce',
      tables: ['orders'],
      variants: {
        data: [
          { table: 'orders', status: 'completed', schema: 'ecommerce' },
          { table: 'orders', status: 'pending', schema: 'ecommerce' },
          { table: 'products', status: 'active', schema: 'ecommerce' },
          { table: 'customers', status: 'verified', schema: 'ecommerce' },
          { table: 'employees', status: 'active', schema: 'company' },
        ]
      },
      description: 'Count the total number of {data.status} records in the {data.table} table.',
      contextBuilder: (vars) => {
        const cols = schemas[vars.data.schema][vars.data.table];
        return {
          tables: [{
            name: vars.data.table,
            columns: cols
          }]
        };
      },
      solution: 'SELECT COUNT(*) FROM {data.table} WHERE status = \'{data.status}\'',
      hint: 'Use COUNT(*) to count all rows matching your WHERE condition'
    },
    {
      id: 'order-by',
      title: 'Sort Products by Price',
      schema: 'ecommerce',
      tables: ['products'],
      variants: {
        data: [
          { table: 'products', column: 'price', order: 'DESC', desc: 'highest to lowest price', schema: 'ecommerce' },
          { table: 'products', column: 'price', order: 'ASC', desc: 'lowest to highest price', schema: 'ecommerce' },
          { table: 'orders', column: 'total_amount', order: 'DESC', desc: 'highest to lowest amount', schema: 'ecommerce' },
          { table: 'employees', column: 'salary', order: 'DESC', desc: 'highest to lowest salary', schema: 'company' },
          { table: 'employees', column: 'hire_date', order: 'ASC', desc: 'oldest to newest hire', schema: 'company' },
        ]
      },
      description: 'Select all records from {data.table} ordered by {data.column} ({data.desc}).',
      contextBuilder: (vars) => {
        const cols = schemas[vars.data.schema][vars.data.table];
        return {
          tables: [{
            name: vars.data.table,
            columns: cols
          }]
        };
      },
      solution: 'SELECT * FROM {data.table} ORDER BY {data.column} {data.order}',
      hint: 'Use ORDER BY with the column name followed by ASC (ascending) or DESC (descending)'
    },
    {
      id: 'limit-results',
      title: 'Top 5 Highest Priced Products',
      schema: 'ecommerce',
      tables: ['products'],
      variants: {
        data: [
          { table: 'products', column: 'price', number: '5', desc: 'most expensive', schema: 'ecommerce' },
          { table: 'products', column: 'price', number: '10', desc: 'most expensive', schema: 'ecommerce' },
          { table: 'orders', column: 'total_amount', number: '5', desc: 'largest', schema: 'ecommerce' },
          { table: 'employees', column: 'salary', number: '3', desc: 'highest paid', schema: 'company' },
          { table: 'sales', column: 'amount', number: '10', desc: 'biggest', schema: 'sales' },
        ]
      },
      description: 'Find the top {data.number} {data.desc} records from the {data.table} table.',
      contextBuilder: (vars) => {
        const cols = schemas[vars.data.schema][vars.data.table];
        return {
          tables: [{
            name: vars.data.table,
            columns: cols
          }]
        };
      },
      solution: 'SELECT * FROM {data.table} ORDER BY {data.column} DESC LIMIT {data.number}',
      hint: 'Combine ORDER BY DESC with LIMIT to get the top N records'
    },
    {
      id: 'select-specific-columns',
      title: 'Select Specific Customer Information',
      schema: 'ecommerce',
      tables: ['customers'],
      variants: {
        data: [
          { table: 'customers', cols: 'first_name, last_name, email', schema: 'ecommerce' },
          { table: 'products', cols: 'product_name, price', schema: 'ecommerce' },
          { table: 'employees', cols: 'first_name, last_name, department_id', schema: 'company' },
          { table: 'orders', cols: 'order_id, customer_id, total_amount', schema: 'ecommerce' },
        ]
      },
      description: 'Select only {data.cols} from the {data.table} table.',
      contextBuilder: (vars) => {
        const cols = schemas[vars.data.schema][vars.data.table];
        return {
          tables: [{
            name: vars.data.table,
            columns: cols
          }]
        };
      },
      solution: 'SELECT {data.cols} FROM {data.table}',
      hint: 'List specific column names separated by commas instead of using *'
    },
    {
      id: 'where-comparison',
      title: 'Find Expensive Products',
      schema: 'ecommerce',
      tables: ['products'],
      variants: {
        data: [
          { table: 'products', column: 'price', operator: '>', value: '100', desc: 'greater than $100', schema: 'ecommerce' },
          { table: 'products', column: 'stock_quantity', operator: '<', value: '10', desc: 'less than 10', schema: 'ecommerce' },
          { table: 'orders', column: 'total_amount', operator: '>=', value: '500', desc: 'greater than or equal to $500', schema: 'ecommerce' },
          { table: 'employees', column: 'salary', operator: '>', value: '75000', desc: 'greater than $75,000', schema: 'company' },
        ]
      },
      description: 'Select all records from {data.table} where {data.column} is {data.desc}.',
      contextBuilder: (vars) => {
        const cols = schemas[vars.data.schema][vars.data.table];
        return {
          tables: [{
            name: vars.data.table,
            columns: cols
          }]
        };
      },
      solution: 'SELECT * FROM {data.table} WHERE {data.column} {data.operator} {data.value}',
      hint: 'Use comparison operators like >, <, >=, <=, = in your WHERE clause'
    },
    {
      id: 'like-pattern',
      title: 'Search Customers by Name',
      schema: 'ecommerce',
      tables: ['customers'],
      variants: {
        data: [
          { table: 'customers', column: 'email', pattern: '%@gmail.com', desc: 'Gmail addresses', schema: 'ecommerce' },
          { table: 'customers', column: 'first_name', pattern: 'J%', desc: 'names starting with J', schema: 'ecommerce' },
          { table: 'products', column: 'product_name', pattern: '%Phone%', desc: 'products containing "Phone"', schema: 'ecommerce' },
          { table: 'employees', column: 'email', pattern: '%@company.com', desc: 'company email addresses', schema: 'company' },
        ]
      },
      description: 'Find all records in {data.table} with {data.desc}.',
      contextBuilder: (vars) => {
        const cols = schemas[vars.data.schema][vars.data.table];
        return {
          tables: [{
            name: vars.data.table,
            columns: cols
          }]
        };
      },
      solution: 'SELECT * FROM {data.table} WHERE {data.column} LIKE \'{data.pattern}\'',
      hint: 'Use LIKE with % as a wildcard for pattern matching'
    },
    {
      id: 'distinct-values',
      title: 'Find Unique Categories',
      schema: 'ecommerce',
      tables: ['products'],
      variants: {
        data: [
          { table: 'products', column: 'category', desc: 'product categories', schema: 'ecommerce' },
          { table: 'orders', column: 'status', desc: 'order statuses', schema: 'ecommerce' },
          { table: 'employees', column: 'department_id', desc: 'departments', schema: 'company' },
          { table: 'sales', column: 'region', desc: 'sales regions', schema: 'sales' },
        ]
      },
      description: 'Get all unique {data.desc} from the {data.table} table.',
      contextBuilder: (vars) => {
        const cols = schemas[vars.data.schema][vars.data.table];
        return {
          tables: [{
            name: vars.data.table,
            columns: cols
          }]
        };
      },
      solution: 'SELECT DISTINCT {data.column} FROM {data.table}',
      hint: 'Use DISTINCT to eliminate duplicate values from results'
    },
    {
      id: 'between-range',
      title: 'Find Products in Price Range',
      schema: 'ecommerce',
      tables: ['products'],
      variants: {
        data: [
          { table: 'products', column: 'price', min: '50', max: '200', desc: 'between $50 and $200', schema: 'ecommerce' },
          { table: 'orders', column: 'total_amount', min: '100', max: '1000', desc: 'between $100 and $1000', schema: 'ecommerce' },
          { table: 'employees', column: 'salary', min: '50000', max: '100000', desc: 'between $50,000 and $100,000', schema: 'company' },
        ]
      },
      description: 'Select all records from {data.table} where {data.column} is {data.desc}.',
      contextBuilder: (vars) => {
        const cols = schemas[vars.data.schema][vars.data.table];
        return {
          tables: [{
            name: vars.data.table,
            columns: cols
          }]
        };
      },
      solution: 'SELECT * FROM {data.table} WHERE {data.column} BETWEEN {data.min} AND {data.max}',
      hint: 'Use BETWEEN to filter values within a range (inclusive)'
    },
    {
      id: 'in-list',
      title: 'Find Orders with Specific Statuses',
      schema: 'ecommerce',
      tables: ['orders'],
      variants: {
        data: [
          { table: 'orders', column: 'status', values: '\'pending\', \'processing\'', desc: 'pending or processing', schema: 'ecommerce' },
          { table: 'products', column: 'category', values: '\'Electronics\', \'Computers\'', desc: 'Electronics or Computers', schema: 'ecommerce' },
          { table: 'employees', column: 'department_id', values: '1, 2, 3', desc: 'departments 1, 2, or 3', schema: 'company' },
        ]
      },
      description: 'Select all {data.table} where {data.column} is {data.desc}.',
      contextBuilder: (vars) => {
        const cols = schemas[vars.data.schema][vars.data.table];
        return {
          tables: [{
            name: vars.data.table,
            columns: cols
          }]
        };
      },
      solution: 'SELECT * FROM {data.table} WHERE {data.column} IN ({data.values})',
      hint: 'Use IN with a comma-separated list of values in parentheses'
    },
    {
      id: 'null-check',
      title: 'Find Customers Without Email',
      schema: 'ecommerce',
      tables: ['customers'],
      variants: {
        data: [
          { table: 'customers', column: 'email', nullCheck: 'IS NULL', desc: 'without an email address', schema: 'ecommerce' },
          { table: 'employees', column: 'manager_id', nullCheck: 'IS NULL', desc: 'without a manager', schema: 'company' },
          { table: 'orders', column: 'shipping_address', nullCheck: 'IS NOT NULL', desc: 'with a shipping address', schema: 'ecommerce' },
        ]
      },
      description: 'Find all records in {data.table} {data.desc}.',
      contextBuilder: (vars) => {
        const cols = schemas[vars.data.schema][vars.data.table];
        return {
          tables: [{
            name: vars.data.table,
            columns: cols
          }]
        };
      },
      solution: 'SELECT * FROM {data.table} WHERE {data.column} {data.nullCheck}',
      hint: 'Use IS NULL or IS NOT NULL to check for missing values'
    },
    {
      id: 'aggregate-functions',
      title: 'Calculate Total Sales',
      schema: 'ecommerce',
      tables: ['orders'],
      variants: {
        data: [
          { table: 'orders', func: 'SUM', column: 'total_amount', desc: 'total sales amount', schema: 'ecommerce' },
          { table: 'products', func: 'AVG', column: 'price', desc: 'average product price', schema: 'ecommerce' },
          { table: 'orders', func: 'MAX', column: 'total_amount', desc: 'highest order amount', schema: 'ecommerce' },
          { table: 'employees', func: 'MIN', column: 'salary', desc: 'lowest employee salary', schema: 'company' },
        ]
      },
      description: 'Calculate the {data.desc} from the {data.table} table.',
      contextBuilder: (vars) => {
        const cols = schemas[vars.data.schema][vars.data.table];
        return {
          tables: [{
            name: vars.data.table,
            columns: cols
          }]
        };
      },
      solution: 'SELECT {data.func}({data.column}) FROM {data.table}',
      hint: 'Use aggregate functions like SUM, AVG, MAX, MIN, or COUNT'
    }
  ],
  medium: [
    {
      id: 'join-tables',
      title: 'Join Customers with Their Orders',
      schema: 'ecommerce',
      tables: ['customers', 'orders'],
      variants: {
        data: [
          { 
            table1: 'customers', 
            table2: 'orders', 
            col1: 'first_name',
            col2: 'last_name',
            col3: 'total_amount',
            col4: 'order_date',
            schema: 'ecommerce',
            desc: 'customer names with their order totals and dates'
          },
          { 
            table1: 'orders', 
            table2: 'order_items', 
            col1: 'order_id',
            col2: 'order_date',
            col3: 'quantity',
            col4: 'unit_price',
            schema: 'ecommerce',
            desc: 'order information with item quantities and prices'
          },
          { 
            table1: 'employees', 
            table2: 'departments', 
            col1: 'first_name',
            col2: 'last_name',
            col3: 'department_name',
            col4: 'location',
            schema: 'company',
            desc: 'employee names with their department names and locations'
          },
        ]
      },
      description: 'Join {data.table1} and {data.table2} to show {data.desc}.',
      contextBuilder: (vars) => {
        const cols1 = schemas[vars.data.schema][vars.data.table1];
        const cols2 = schemas[vars.data.schema][vars.data.table2];
        return {
          tables: [
            { name: vars.data.table1, columns: cols1 },
            { name: vars.data.table2, columns: cols2 }
          ]
        };
      },
      solution: 'SELECT c.{data.col1}, c.{data.col2}, o.{data.col3}, o.{data.col4} FROM {data.table1} c JOIN {data.table2} o ON c.{data.table1}_id = o.{data.table1}_id',
      hint: 'Use JOIN with ON to connect tables through their foreign key relationship'
    },
    {
      id: 'group-by-aggregate',
      title: 'Total Sales by Customer',
      schema: 'ecommerce',
      tables: ['orders'],
      variants: {
        data: [
          { 
            table: 'orders', 
            groupCol: 'customer_id', 
            aggFunc: 'SUM', 
            aggCol: 'total_amount',
            desc: 'total order amount',
            schema: 'ecommerce'
          },
          { 
            table: 'order_items', 
            groupCol: 'product_id', 
            aggFunc: 'SUM', 
            aggCol: 'quantity',
            desc: 'total quantity sold',
            schema: 'ecommerce'
          },
          { 
            table: 'assignments', 
            groupCol: 'employee_id', 
            aggFunc: 'SUM', 
            aggCol: 'hours_allocated',
            desc: 'total hours allocated',
            schema: 'company'
          },
          { 
            table: 'sales', 
            groupCol: 'region', 
            aggFunc: 'AVG', 
            aggCol: 'amount',
            desc: 'average sale amount',
            schema: 'sales'
          },
        ]
      },
      description: 'Calculate the {data.desc} for each {data.groupCol}.',
      contextBuilder: (vars) => {
        const cols = schemas[vars.data.schema][vars.data.table];
        return {
          tables: [{
            name: vars.data.table,
            columns: cols
          }]
        };
      },
      solution: 'SELECT {data.groupCol}, {data.aggFunc}({data.aggCol}) as total FROM {data.table} GROUP BY {data.groupCol}',
      hint: 'Use GROUP BY with aggregate functions like SUM, AVG, COUNT, MAX, or MIN'
    },
    {
      id: 'having-clause',
      title: 'Customers with High Order Totals',
      schema: 'ecommerce',
      tables: ['orders'],
      variants: {
        data: [
          { 
            table: 'orders', 
            groupCol: 'customer_id',
            aggFunc: 'SUM',
            aggCol: 'total_amount',
            threshold: '1000',
            desc: 'spent more than $1000',
            schema: 'ecommerce'
          },
          { 
            table: 'order_items', 
            groupCol: 'order_id',
            aggFunc: 'COUNT',
            aggCol: '*',
            threshold: '5',
            desc: 'have more than 5 items',
            schema: 'ecommerce'
          },
          { 
            table: 'assignments', 
            groupCol: 'project_id',
            aggFunc: 'SUM',
            aggCol: 'hours_allocated',
            threshold: '100',
            desc: 'have more than 100 hours allocated',
            schema: 'company'
          },
        ]
      },
      description: 'Find all {data.groupCol}s that {data.desc}.',
      contextBuilder: (vars) => {
        const cols = schemas[vars.data.schema][vars.data.table];
        return {
          tables: [{
            name: vars.data.table,
            columns: cols
          }]
        };
      },
      solution: 'SELECT {data.groupCol}, {data.aggFunc}({data.aggCol}) as total FROM {data.table} GROUP BY {data.groupCol} HAVING total > {data.threshold}',
      hint: 'Use HAVING to filter aggregated results after GROUP BY (WHERE filters before grouping)'
    },
    {
      id: 'subquery',
      title: 'Products Above Average Price',
      schema: 'ecommerce',
      tables: ['products'],
      variants: {
        data: [
          { 
            table: 'products',
            column: 'price',
            comparison: 'above',
            aggFunc: 'AVG',
            schema: 'ecommerce'
          },
          { 
            table: 'employees',
            column: 'salary',
            comparison: 'above',
            aggFunc: 'AVG',
            schema: 'company'
          },
          { 
            table: 'orders',
            column: 'total_amount',
            comparison: 'below',
            aggFunc: 'AVG',
            schema: 'ecommerce'
          },
        ]
      },
      description: 'Find all records where {data.column} is {data.comparison} the average.',
      contextBuilder: (vars) => {
        const cols = schemas[vars.data.schema][vars.data.table];
        return {
          tables: [{
            name: vars.data.table,
            columns: cols
          }]
        };
      },
      solution: 'SELECT * FROM {data.table} WHERE {data.column} > (SELECT {data.aggFunc}({data.column}) FROM {data.table})',
      hint: 'Use a subquery in parentheses with an aggregate function to calculate the comparison value'
    },
    {
      id: 'left-join',
      title: 'All Customers with Optional Order Data',
      schema: 'ecommerce',
      tables: ['customers', 'orders'],
      variants: {
        data: [
          { 
            table1: 'customers',
            table2: 'orders',
            desc: 'all customers including those without orders',
            schema: 'ecommerce'
          },
          { 
            table1: 'products',
            table2: 'order_items',
            desc: 'all products including those never ordered',
            schema: 'ecommerce'
          },
          { 
            table1: 'employees',
            table2: 'assignments',
            desc: 'all employees including those without project assignments',
            schema: 'company'
          },
        ]
      },
      description: 'Show {data.desc} using a LEFT JOIN.',
      contextBuilder: (vars) => {
        const cols1 = schemas[vars.data.schema][vars.data.table1];
        const cols2 = schemas[vars.data.schema][vars.data.table2];
        return {
          tables: [
            { name: vars.data.table1, columns: cols1 },
            { name: vars.data.table2, columns: cols2 }
          ]
        };
      },
      solution: 'SELECT * FROM {data.table1} LEFT JOIN {data.table2} ON {data.table1}.{data.table1}_id = {data.table2}.{data.table1}_id',
      hint: 'LEFT JOIN returns all records from the left table, even if there are no matches in the right table'
    },
    {
      id: 'count-with-group',
      title: 'Count Orders per Customer',
      schema: 'ecommerce',
      tables: ['orders'],
      variants: {
        data: [
          { 
            table: 'orders',
            groupCol: 'customer_id',
            desc: 'number of orders per customer',
            schema: 'ecommerce'
          },
          { 
            table: 'order_items',
            groupCol: 'order_id',
            desc: 'number of items per order',
            schema: 'ecommerce'
          },
          { 
            table: 'assignments',
            groupCol: 'employee_id',
            desc: 'number of projects per employee',
            schema: 'company'
          },
          { 
            table: 'sales',
            groupCol: 'sales_rep_id',
            desc: 'number of sales per rep',
            schema: 'sales'
          },
        ]
      },
      description: 'Calculate the {data.desc}.',
      contextBuilder: (vars) => {
        const cols = schemas[vars.data.schema][vars.data.table];
        return {
          tables: [{
            name: vars.data.table,
            columns: cols
          }]
        };
      },
      solution: 'SELECT {data.groupCol}, COUNT(*) as count FROM {data.table} GROUP BY {data.groupCol}',
      hint: 'Use COUNT(*) with GROUP BY to count records in each group'
    },
    {
      id: 'multiple-joins',
      title: 'Product Sales Details',
      schema: 'ecommerce',
      tables: ['products', 'order_items', 'orders'],
      variants: {
        data: [
          { 
            table1: 'products',
            table2: 'order_items',
            table3: 'orders',
            desc: 'product names with order dates',
            schema: 'ecommerce'
          },
          { 
            table1: 'employees',
            table2: 'assignments',
            table3: 'projects',
            desc: 'employee names with project names',
            schema: 'company'
          },
        ]
      },
      description: 'Join three tables to show {data.desc}.',
      contextBuilder: (vars) => {
        const cols1 = schemas[vars.data.schema][vars.data.table1];
        const cols2 = schemas[vars.data.schema][vars.data.table2];
        const cols3 = schemas[vars.data.schema][vars.data.table3];
        return {
          tables: [
            { name: vars.data.table1, columns: cols1 },
            { name: vars.data.table2, columns: cols2 },
            { name: vars.data.table3, columns: cols3 }
          ]
        };
      },
      solution: 'SELECT p.*, o.order_date FROM {data.table1} p JOIN {data.table2} oi ON p.{data.table1}_id = oi.{data.table1}_id JOIN {data.table3} o ON oi.{data.table3}_id = o.{data.table3}_id',
      hint: 'Chain multiple JOINs together, connecting each table through their foreign keys'
    },
    {
      id: 'where-and-group',
      title: 'Active Product Sales by Category',
      schema: 'ecommerce',
      tables: ['order_items', 'products'],
      variants: {
        data: [
          { 
            filterTable: 'products',
            filterCol: 'status',
            filterVal: 'active',
            groupCol: 'category',
            aggFunc: 'SUM',
            aggCol: 'quantity',
            desc: 'total sales quantity by category for active products',
            schema: 'ecommerce'
          },
          { 
            filterTable: 'orders',
            filterCol: 'status',
            filterVal: 'completed',
            groupCol: 'customer_id',
            aggFunc: 'SUM',
            aggCol: 'total_amount',
            desc: 'total spending by customer for completed orders',
            schema: 'ecommerce'
          },
        ]
      },
      description: 'Calculate {data.desc}.',
      contextBuilder: (vars) => {
        const cols = schemas[vars.data.schema][vars.data.filterTable];
        return {
          tables: [{
            name: vars.data.filterTable,
            columns: cols
          }]
        };
      },
      solution: 'SELECT {data.groupCol}, {data.aggFunc}({data.aggCol}) FROM {data.filterTable} WHERE {data.filterCol} = \'{data.filterVal}\' GROUP BY {data.groupCol}',
      hint: 'Use WHERE to filter before grouping, then apply GROUP BY with aggregate functions'
    },
    {
      id: 'order-aggregate',
      title: 'Top Spending Customers',
      schema: 'ecommerce',
      tables: ['orders'],
      variants: {
        data: [
          { 
            table: 'orders',
            groupCol: 'customer_id',
            aggFunc: 'SUM',
            aggCol: 'total_amount',
            orderDir: 'DESC',
            limit: '10',
            desc: 'top 10 customers by total spending',
            schema: 'ecommerce'
          },
          { 
            table: 'sales',
            groupCol: 'sales_rep_id',
            aggFunc: 'COUNT',
            aggCol: '*',
            orderDir: 'DESC',
            limit: '5',
            desc: 'top 5 sales reps by number of sales',
            schema: 'sales'
          },
        ]
      },
      description: 'Find the {data.desc}.',
      contextBuilder: (vars) => {
        const cols = schemas[vars.data.schema][vars.data.table];
        return {
          tables: [{
            name: vars.data.table,
            columns: cols
          }]
        };
      },
      solution: 'SELECT {data.groupCol}, {data.aggFunc}({data.aggCol}) as total FROM {data.table} GROUP BY {data.groupCol} ORDER BY total {data.orderDir} LIMIT {data.limit}',
      hint: 'Combine GROUP BY, aggregate functions, ORDER BY, and LIMIT to get top results'
    },
    {
      id: 'case-when',
      title: 'Categorize Products by Price',
      schema: 'ecommerce',
      tables: ['products'],
      variants: {
        data: [
          { 
            table: 'products',
            column: 'price',
            threshold1: '50',
            threshold2: '200',
            cat1: 'Budget',
            cat2: 'Mid-Range',
            cat3: 'Premium',
            desc: 'price categories (Budget, Mid-Range, Premium)',
            schema: 'ecommerce'
          },
          { 
            table: 'employees',
            column: 'salary',
            threshold1: '50000',
            threshold2: '100000',
            cat1: 'Entry',
            cat2: 'Mid',
            cat3: 'Senior',
            desc: 'salary levels (Entry, Mid, Senior)',
            schema: 'company'
          },
        ]
      },
      description: 'Add a calculated column to categorize {data.table} by {data.desc}.',
      contextBuilder: (vars) => {
        const cols = schemas[vars.data.schema][vars.data.table];
        return {
          tables: [{
            name: vars.data.table,
            columns: cols
          }]
        };
      },
      solution: 'SELECT *, CASE WHEN {data.column} < {data.threshold1} THEN \'{data.cat1}\' WHEN {data.column} < {data.threshold2} THEN \'{data.cat2}\' ELSE \'{data.cat3}\' END as category FROM {data.table}',
      hint: 'Use CASE WHEN to create conditional logic and assign categories based on column values'
    }
  ],
  hard: [
    {
      id: 'window-function',
      title: 'Rank Employees by Salary Within Department',
      schema: 'company',
      tables: ['employees'],
      variants: {
        data: [
          { 
            table: 'employees',
            partition: 'department_id',
            orderBy: 'salary',
            rankType: 'RANK',
            desc: 'by salary within each department',
            schema: 'company'
          },
          { 
            table: 'products',
            partition: 'category',
            orderBy: 'price',
            rankType: 'ROW_NUMBER',
            desc: 'by price within each category',
            schema: 'ecommerce'
          },
          { 
            table: 'sales',
            partition: 'region',
            orderBy: 'amount',
            rankType: 'DENSE_RANK',
            desc: 'by sale amount within each region',
            schema: 'sales'
          },
        ]
      },
      description: 'Rank records in {data.table} {data.desc} using the {data.rankType}() window function.',
      contextBuilder: (vars) => {
        const cols = schemas[vars.data.schema][vars.data.table];
        return {
          tables: [{
            name: vars.data.table,
            columns: cols
          }]
        };
      },
      solution: 'SELECT *, {data.rankType}() OVER (PARTITION BY {data.partition} ORDER BY {data.orderBy} DESC) as rank FROM {data.table}',
      hint: 'Window functions use OVER clause. PARTITION BY splits data into groups, ORDER BY determines ranking'
    },
    {
      id: 'recursive-cte',
      title: 'Recursive Employee Hierarchy',
      schema: 'company',
      tables: ['employees'],
      variants: {
        data: [
          { 
            table: 'employees',
            idCol: 'employee_id',
            parentCol: 'manager_id',
            nameCol: 'first_name',
            desc: 'employee reporting hierarchy',
            schema: 'company'
          },
          { 
            table: 'categories',
            idCol: 'category_id',
            parentCol: 'parent_category_id',
            nameCol: 'category_name',
            desc: 'category tree structure',
            schema: 'ecommerce'
          },
        ]
      },
      description: 'Create a recursive query to traverse the {data.desc}.',
      contextBuilder: (vars) => {
        const cols = schemas[vars.data.schema][vars.data.table];
        return {
          tables: [{
            name: vars.data.table,
            columns: cols
          }]
        };
      },
      solution: 'WITH RECURSIVE hierarchy AS (SELECT {data.idCol}, {data.nameCol}, {data.parentCol}, 1 as level FROM {data.table} WHERE {data.parentCol} IS NULL UNION ALL SELECT t.{data.idCol}, t.{data.nameCol}, t.{data.parentCol}, h.level + 1 FROM {data.table} t JOIN hierarchy h ON t.{data.parentCol} = h.{data.idCol}) SELECT * FROM hierarchy ORDER BY level, {data.idCol}',
      hint: 'WITH RECURSIVE creates a CTE that references itself. Start with base case, UNION ALL with recursive case'
    },
    {
      id: 'complex-join',
      title: 'Customer Lifetime Value Analysis',
      schema: 'ecommerce',
      tables: ['customers', 'orders', 'order_items'],
      variants: {
        data: [
          { 
            table1: 'customers',
            table2: 'orders',
            table3: 'order_items',
            metric: 'total revenue',
            desc: 'total revenue generated by each customer',
            schema: 'ecommerce'
          },
          { 
            table1: 'employees',
            table2: 'assignments',
            table3: 'projects',
            metric: 'total project budget',
            desc: 'total project budget managed by each employee',
            schema: 'company'
          },
        ]
      },
      description: 'Calculate {data.metric} by joining {data.table1}, {data.table2}, and {data.table3}.',
      contextBuilder: (vars) => {
        const cols1 = schemas[vars.data.schema][vars.data.table1];
        const cols2 = schemas[vars.data.schema][vars.data.table2];
        const cols3 = schemas[vars.data.schema][vars.data.table3];
        return {
          tables: [
            { name: vars.data.table1, columns: cols1 },
            { name: vars.data.table2, columns: cols2 },
            { name: vars.data.table3, columns: cols3 }
          ]
        };
      },
      solution: 'SELECT c.{data.table1}_id, c.first_name, c.last_name, SUM(oi.quantity * oi.unit_price) as lifetime_value FROM {data.table1} c JOIN {data.table2} o ON c.{data.table1}_id = o.{data.table1}_id JOIN {data.table3} oi ON o.{data.table2}_id = oi.{data.table2}_id GROUP BY c.{data.table1}_id, c.first_name, c.last_name ORDER BY lifetime_value DESC',
      hint: 'Chain JOINs: table1 JOIN table2 ON ... JOIN table3 ON ..., then use SUM with GROUP BY'
    },
    {
      id: 'pivot-analysis',
      title: 'Monthly Sales Pivot by Product',
      schema: 'ecommerce',
      tables: ['orders', 'order_items', 'products'],
      variants: {
        data: [
          { 
            dimension1: 'product',
            dimension2: 'month',
            metric: 'revenue',
            desc: 'monthly revenue for each product',
            schema: 'ecommerce'
          },
          { 
            dimension1: 'region',
            dimension2: 'quarter',
            metric: 'sales count',
            desc: 'quarterly sales count for each region',
            schema: 'sales'
          },
        ]
      },
      description: 'Create a pivot showing {data.desc}.',
      contextBuilder: (vars) => {
        return {
          tables: [
            { name: 'orders', columns: schemas.ecommerce.orders },
            { name: 'order_items', columns: schemas.ecommerce.order_items },
            { name: 'products', columns: schemas.ecommerce.products }
          ]
        };
      },
      solution: 'SELECT p.product_name, SUM(CASE WHEN EXTRACT(MONTH FROM o.order_date) = 1 THEN oi.quantity * oi.unit_price ELSE 0 END) as Jan, SUM(CASE WHEN EXTRACT(MONTH FROM o.order_date) = 2 THEN oi.quantity * oi.unit_price ELSE 0 END) as Feb, SUM(CASE WHEN EXTRACT(MONTH FROM o.order_date) = 3 THEN oi.quantity * oi.unit_price ELSE 0 END) as Mar FROM products p JOIN order_items oi ON p.product_id = oi.product_id JOIN orders o ON oi.order_id = o.order_id GROUP BY p.product_name',
      hint: 'Use CASE WHEN inside aggregate functions to pivot rows into columns. Each CASE creates one output column'
    },
    {
      id: 'running-total',
      title: 'Running Total of Sales',
      schema: 'sales',
      tables: ['sales'],
      variants: {
        data: [
          { 
            table: 'sales',
            orderCol: 'sale_date',
            sumCol: 'amount',
            partitionCol: 'sales_rep_id',
            desc: 'running total of sales amount per rep over time',
            schema: 'sales'
          },
          { 
            table: 'orders',
            orderCol: 'order_date',
            sumCol: 'total_amount',
            partitionCol: 'customer_id',
            desc: 'running total of order amounts per customer',
            schema: 'ecommerce'
          },
        ]
      },
      description: 'Calculate the {data.desc} using a window function.',
      contextBuilder: (vars) => {
        const cols = schemas[vars.data.schema][vars.data.table];
        return {
          tables: [{
            name: vars.data.table,
            columns: cols
          }]
        };
      },
      solution: 'SELECT *, SUM({data.sumCol}) OVER (PARTITION BY {data.partitionCol} ORDER BY {data.orderCol}) as running_total FROM {data.table}',
      hint: 'Use SUM() OVER with PARTITION BY and ORDER BY to create cumulative totals within groups'
    },
    {
      id: 'lag-lead',
      title: 'Compare with Previous Record',
      schema: 'ecommerce',
      tables: ['orders'],
      variants: {
        data: [
          { 
            table: 'orders',
            partitionCol: 'customer_id',
            orderCol: 'order_date',
            valueCol: 'total_amount',
            func: 'LAG',
            desc: 'compare each order with the previous order for the same customer',
            schema: 'ecommerce'
          },
          { 
            table: 'sales',
            partitionCol: 'sales_rep_id',
            orderCol: 'sale_date',
            valueCol: 'amount',
            func: 'LEAD',
            desc: 'compare each sale with the next sale for the same rep',
            schema: 'sales'
          },
        ]
      },
      description: 'Use {data.func}() to {data.desc}.',
      contextBuilder: (vars) => {
        const cols = schemas[vars.data.schema][vars.data.table];
        return {
          tables: [{
            name: vars.data.table,
            columns: cols
          }]
        };
      },
      solution: 'SELECT *, {data.func}({data.valueCol}) OVER (PARTITION BY {data.partitionCol} ORDER BY {data.orderCol}) as prev_value FROM {data.table}',
      hint: 'LAG() accesses previous row values, LEAD() accesses next row values within a partition'
    },
    {
      id: 'correlated-subquery',
      title: 'Find Customers with Above-Average Orders',
      schema: 'ecommerce',
      tables: ['customers', 'orders'],
      variants: {
        data: [
          { 
            outerTable: 'customers',
            innerTable: 'orders',
            linkCol: 'customer_id',
            compareCol: 'total_amount',
            desc: 'customers whose average order value exceeds the global average',
            schema: 'ecommerce'
          },
          { 
            outerTable: 'employees',
            innerTable: 'assignments',
            linkCol: 'employee_id',
            compareCol: 'hours_allocated',
            desc: 'employees whose average hours per project exceeds the global average',
            schema: 'company'
          },
        ]
      },
      description: 'Find {data.desc} using a correlated subquery.',
      contextBuilder: (vars) => {
        const cols1 = schemas[vars.data.schema][vars.data.outerTable];
        const cols2 = schemas[vars.data.schema][vars.data.innerTable];
        return {
          tables: [
            { name: vars.data.outerTable, columns: cols1 },
            { name: vars.data.innerTable, columns: cols2 }
          ]
        };
      },
      solution: 'SELECT * FROM {data.outerTable} c WHERE (SELECT AVG({data.compareCol}) FROM {data.innerTable} WHERE {data.linkCol} = c.{data.linkCol}) > (SELECT AVG({data.compareCol}) FROM {data.innerTable})',
      hint: 'A correlated subquery references the outer query. Compare per-group averages against global average'
    },
    {
      id: 'ntile',
      title: 'Divide Products into Quartiles by Price',
      schema: 'ecommerce',
      tables: ['products'],
      variants: {
        data: [
          { 
            table: 'products',
            column: 'price',
            buckets: '4',
            desc: 'price quartiles (4 equal groups)',
            schema: 'ecommerce'
          },
          { 
            table: 'employees',
            column: 'salary',
            buckets: '5',
            desc: 'salary quintiles (5 equal groups)',
            schema: 'company'
          },
          { 
            table: 'sales',
            column: 'amount',
            buckets: '10',
            desc: 'sale amount deciles (10 equal groups)',
            schema: 'sales'
          },
        ]
      },
      description: 'Divide {data.table} into {data.desc} using NTILE().',
      contextBuilder: (vars) => {
        const cols = schemas[vars.data.schema][vars.data.table];
        return {
          tables: [{
            name: vars.data.table,
            columns: cols
          }]
        };
      },
      solution: 'SELECT *, NTILE({data.buckets}) OVER (ORDER BY {data.column}) as bucket FROM {data.table}',
      hint: 'NTILE(n) divides ordered rows into n approximately equal groups'
    }
  ]
};

// Generate a random problem from a template
const generateProblem = (template) => {
  const problem = { ...template };
  
  // Select random variants for each key
  const selectedVariants = {};
  Object.keys(template.variants).forEach(key => {
    const variants = template.variants[key];
    selectedVariants[key] = variants[Math.floor(Math.random() * variants.length)];
  });
  
  // Replace placeholders in title, description, solution
  let title = template.title;
  let description = template.description;
  let solution = template.solution;
  let context = '';
  
  // Build context if contextBuilder exists
  if (template.contextBuilder) {
    context = template.contextBuilder(selectedVariants);
  }
  
  // Replace all placeholders with selected variant values
  const replacePlaceholders = (text, vars) => {
    let result = text;
    Object.keys(vars).forEach(key => {
      const value = vars[key];
      if (typeof value === 'object') {
        // Handle nested objects (like data.table, data.status)
        Object.keys(value).forEach(nestedKey => {
          const placeholder = new RegExp(`\\{${key}\\.${nestedKey}\\}`, 'g');
          result = result.replace(placeholder, value[nestedKey]);
        });
      } else {
        const placeholder = new RegExp(`\\{${key}\\}`, 'g');
        result = result.replace(placeholder, value);
      }
    });
    return result;
  };
  
  title = replacePlaceholders(title, selectedVariants);
  description = replacePlaceholders(description, selectedVariants);
  solution = replacePlaceholders(solution, selectedVariants);
  
  return {
    ...problem,
    title,
    description,
    solution,
    context,
    generatedAt: Date.now()
  };
};

const SQLPracticeGame = () => {
  const [difficulty, setDifficulty] = useState(null);
  const [currentProblem, setCurrentProblem] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [stats, setStats] = useState({ solved: 0, attempted: 0 });
  const [showSolution, setShowSolution] = useState(false);
  const [showProblemList, setShowProblemList] = useState(false);

  const startPractice = (level) => {
    setDifficulty(level);
    setShowProblemList(true);
    setFeedback(null);
    setShowSolution(false);
  };

  const selectProblem = (template) => {
    const problem = generateProblem(template);
    setCurrentProblem(problem);
    setUserAnswer('');
    setShowHint(false);
    setFeedback(null);
    setShowSolution(false);
    setShowProblemList(false);
  };

  const generateNewProblem = (level) => {
    const templates = problemTemplates[level || difficulty];
    const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
    const problem = generateProblem(randomTemplate);
    setCurrentProblem(problem);
    setUserAnswer('');
    setShowHint(false);
    setFeedback(null);
    setShowSolution(false);
  };

  const normalizeSQL = (sql) => {
    return sql
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/\s*,\s*/g, ',')
      .replace(/\s*\(\s*/g, '(')
      .replace(/\s*\)\s*/g, ')')
      .toUpperCase();
  };

  const checkAnswer = () => {
    const normalized = normalizeSQL(userAnswer);
    const normalizedSolution = normalizeSQL(currentProblem.solution);
    
    const isCorrect = normalized === normalizedSolution || 
                     normalized.includes(normalizedSolution) ||
                     normalizedSolution.includes(normalized);
    
    setStats(prev => ({
      solved: prev.solved + (isCorrect ? 1 : 0),
      attempted: prev.attempted + 1
    }));
    
    setFeedback(isCorrect ? 'correct' : 'incorrect');
    
    if (isCorrect) {
      setTimeout(() => {
        generateNewProblem();
      }, 2000);
    }
  };

  const ProblemList = () => {
    const templates = problemTemplates[difficulty];
    
    return (
      <div className="problem-list-view">
        <div className="list-header">
          <button className="btn btn-secondary" onClick={() => setDifficulty(null)}>
            ← Back to Difficulty Selection
          </button>
          <h2>Choose a {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Problem</h2>
          <p className="list-subtitle">{templates.length} problems available</p>
        </div>
        
        <div className="problems-grid">
          {templates.map((template, idx) => (
            <button
              key={idx}
              className="problem-item"
              onClick={() => selectProblem(template)}
            >
              <div className="problem-number">#{idx + 1}</div>
              <h3 className="problem-item-title">{template.title}</h3>
              <div className="problem-tables">
                {template.tables.map((table, tIdx) => (
                  <span key={tIdx} className="table-badge">{table}</span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  const DifficultySelector = () => (
    <div className="difficulty-selector">
      <div className="hero-section">
        <div className="neon-glow"></div>
        <Code className="hero-icon" size={64} />
        <h1 className="hero-title">SQL Practice</h1>
        <p className="hero-subtitle">Master SQL through randomized challenges</p>
        <p className="hero-subtitle">Created by Jameel Ganaden</p>
      </div>
      
      <div className="difficulty-cards">
        {['easy', 'medium', 'hard'].map((level) => (
          <button
            key={level}
            onClick={() => startPractice(level)}
            className={`difficulty-card ${level}`}
          >
            <div className="card-icon">
              {level === 'easy' && <BookOpen size={32} />}
              {level === 'medium' && <Zap size={32} />}
              {level === 'hard' && <Trophy size={32} />}
            </div>
            <h3>{level.charAt(0).toUpperCase() + level.slice(1)}</h3>
            <p className="card-description">
              {level === 'easy' && 'Basic queries, SELECT, WHERE, ORDER BY'}
              {level === 'medium' && 'JOINs, GROUP BY, aggregations, subqueries'}
              {level === 'hard' && 'Window functions, CTEs, complex multi-table queries'}
            </p>
            <div className="card-problems">
              {problemTemplates[level].length} problem variations
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="sql-game">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Space+Mono:wght@700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        .sql-game {
          min-height: 100vh;
          background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0f1419 100%);
          color: #e0e7ff;
          font-family: 'JetBrains Mono', monospace;
          position: relative;
          overflow-x: hidden;
        }
        
        .sql-game::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(139, 92, 246, 0.03) 2px,
              rgba(139, 92, 246, 0.03) 4px
            );
          pointer-events: none;
        }
        
        .difficulty-selector {
          padding: 4rem 2rem;
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }
        
        .problem-list-view {
          padding: 2rem;
          max-width: 1400px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }
        
        .list-header {
          text-align: center;
          margin-bottom: 3rem;
        }
        
        .list-header h2 {
          font-size: 2.5rem;
          color: #8b5cf6;
          margin: 1rem 0;
        }
        
        .list-subtitle {
          color: #94a3b8;
          font-size: 1.1rem;
        }
        
        .problems-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
          margin-top: 2rem;
        }
        
        .problem-item {
          background: rgba(30, 41, 59, 0.5);
          border: 2px solid rgba(139, 92, 246, 0.2);
          border-radius: 12px;
          padding: 1.5rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          text-align: left;
          position: relative;
          overflow: hidden;
          backdrop-filter: blur(10px);
        }
        
        .problem-item:hover {
          transform: translateY(-4px);
          border-color: #8b5cf6;
          box-shadow: 0 12px 24px rgba(139, 92, 246, 0.3);
          background: rgba(30, 41, 59, 0.7);
        }
        
        .problem-number {
          position: absolute;
          top: 1rem;
          right: 1rem;
          font-size: 0.875rem;
          color: #8b5cf6;
          font-weight: 700;
          opacity: 0.6;
        }
        
        .problem-item-title {
          font-size: 1.1rem;
          color: #e0e7ff;
          margin-bottom: 1rem;
          line-height: 1.4;
          padding-right: 2rem;
        }
        
        .problem-tables {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        
        .table-badge {
          background: rgba(6, 182, 212, 0.15);
          color: #06b6d4;
          padding: 0.25rem 0.625rem;
          border-radius: 4px;
          font-size: 0.8rem;
          font-family: 'JetBrains Mono', monospace;
          border: 1px solid rgba(6, 182, 212, 0.3);
        }
        
        .difficulty-selector {
          padding: 4rem 2rem;
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }
        
        .hero-section {
          text-align: center;
          margin-bottom: 4rem;
          position: relative;
        }
        
        .neon-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%);
          filter: blur(60px);
          animation: pulse 4s ease-in-out infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.1); }
        }
        
        .hero-icon {
          color: #8b5cf6;
          margin-bottom: 1.5rem;
          animation: float 3s ease-in-out infinite;
          filter: drop-shadow(0 0 20px rgba(139, 92, 246, 0.6));
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .hero-title {
          font-size: 4rem;
          font-weight: 700;
          margin-bottom: 1rem;
          font-family: 'Space Mono', monospace;
          background: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.02em;
          text-shadow: 0 0 40px rgba(139, 92, 246, 0.3);
        }
        
        .hero-subtitle {
          font-size: 1.25rem;
          color: #94a3b8;
          font-weight: 400;
        }
        
        .difficulty-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          margin-top: 3rem;
        }
        
        .difficulty-card {
          background: rgba(30, 41, 59, 0.5);
          border: 2px solid rgba(139, 92, 246, 0.2);
          border-radius: 16px;
          padding: 2.5rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          backdrop-filter: blur(10px);
        }
        
        .difficulty-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, transparent, currentColor, transparent);
          opacity: 0;
          transition: opacity 0.3s;
        }
        
        .difficulty-card:hover {
          transform: translateY(-8px);
          border-color: currentColor;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), 0 0 40px currentColor;
        }
        
        .difficulty-card:hover::before {
          opacity: 1;
        }
        
        .difficulty-card.easy {
          color: #10b981;
        }
        
        .difficulty-card.medium {
          color: #f59e0b;
        }
        
        .difficulty-card.hard {
          color: #ef4444;
        }
        
        .card-icon {
          margin-bottom: 1.5rem;
          opacity: 0.9;
        }
        
        .difficulty-card h3 {
          font-size: 1.75rem;
          margin-bottom: 0.75rem;
          font-weight: 700;
        }
        
        .card-description {
          color: #94a3b8;
          line-height: 1.6;
          margin-bottom: 1.5rem;
          font-size: 0.95rem;
        }
        
        .card-problems {
          font-size: 0.875rem;
          opacity: 0.7;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        .problem-view {
          max-width: 900px;
          margin: 0 auto;
          padding: 2rem;
        }
        
        .stats-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(30, 41, 59, 0.6);
          padding: 1.5rem;
          border-radius: 12px;
          margin-bottom: 2rem;
          border: 1px solid rgba(139, 92, 246, 0.2);
          backdrop-filter: blur(10px);
        }
        
        .stat {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .stat-label {
          color: #94a3b8;
          font-size: 0.875rem;
        }
        
        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #8b5cf6;
        }
        
        .difficulty-badge {
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        .difficulty-badge.easy {
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
          border: 1px solid #10b981;
        }
        
        .difficulty-badge.medium {
          background: rgba(245, 158, 11, 0.2);
          color: #f59e0b;
          border: 1px solid #f59e0b;
        }
        
        .difficulty-badge.hard {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
          border: 1px solid #ef4444;
        }
        
        .problem-card {
          background: rgba(30, 41, 59, 0.6);
          border: 2px solid rgba(139, 92, 246, 0.3);
          border-radius: 16px;
          padding: 2.5rem;
          margin-bottom: 2rem;
          backdrop-filter: blur(10px);
        }
        
        .problem-card h2 {
          font-size: 1.75rem;
          margin-bottom: 1.5rem;
          color: #8b5cf6;
        }
        
        .schema-section {
          margin: 1.5rem 0;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .schema-table {
          background: rgba(15, 23, 42, 0.5);
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 8px;
          padding: 1rem;
        }
        
        .table-name {
          font-weight: 700;
          color: #06b6d4;
          font-size: 1rem;
          margin-bottom: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        .table-columns {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        
        .column-tag {
          background: rgba(139, 92, 246, 0.15);
          color: #c4b5fd;
          padding: 0.375rem 0.75rem;
          border-radius: 6px;
          font-size: 0.875rem;
          font-family: 'JetBrains Mono', monospace;
          border: 1px solid rgba(139, 92, 246, 0.3);
        }
        
        .problem-description {
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(139, 92, 246, 0.2);
        }
        
        .problem-card p {
          color: #cbd5e1;
          line-height: 1.8;
          font-size: 1.1rem;
        }
        
        .editor-section {
          margin-bottom: 2rem;
        }
        
        .editor-label {
          display: block;
          margin-bottom: 0.75rem;
          font-size: 0.875rem;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        
        .sql-editor {
          width: 100%;
          min-height: 180px;
          background: #0f172a;
          border: 2px solid rgba(139, 92, 246, 0.3);
          border-radius: 12px;
          padding: 1.5rem;
          color: #e0e7ff;
          font-family: 'JetBrains Mono', monospace;
          font-size: 1rem;
          resize: vertical;
          transition: all 0.3s;
        }
        
        .sql-editor:focus {
          outline: none;
          border-color: #8b5cf6;
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1), 0 0 20px rgba(139, 92, 246, 0.3);
        }
        
        .actions {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }
        
        .btn {
          padding: 1rem 2rem;
          border: none;
          border-radius: 10px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
          color: white;
          box-shadow: 0 4px 20px rgba(139, 92, 246, 0.4);
        }
        
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(139, 92, 246, 0.6);
        }
        
        .btn-secondary {
          background: rgba(30, 41, 59, 0.8);
          color: #94a3b8;
          border: 2px solid rgba(139, 92, 246, 0.3);
        }
        
        .btn-secondary:hover {
          background: rgba(30, 41, 59, 1);
          color: #e0e7ff;
          border-color: #8b5cf6;
        }
        
        .feedback {
          padding: 1.5rem;
          border-radius: 12px;
          margin-bottom: 2rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          font-weight: 600;
          animation: slideIn 0.3s ease-out;
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .feedback.correct {
          background: rgba(16, 185, 129, 0.2);
          border: 2px solid #10b981;
          color: #10b981;
        }
        
        .feedback.incorrect {
          background: rgba(239, 68, 68, 0.2);
          border: 2px solid #ef4444;
          color: #ef4444;
        }
        
        .hint-box {
          background: rgba(6, 182, 212, 0.1);
          border: 2px solid rgba(6, 182, 212, 0.3);
          border-radius: 12px;
          padding: 1.5rem;
          margin-top: 1rem;
          color: #06b6d4;
        }
        
        .hint-box strong {
          display: block;
          margin-bottom: 0.5rem;
          text-transform: uppercase;
          font-size: 0.875rem;
          letter-spacing: 0.1em;
        }
        
        .solution-box {
          background: rgba(139, 92, 246, 0.1);
          border: 2px solid rgba(139, 92, 246, 0.3);
          border-radius: 12px;
          padding: 1.5rem;
          margin-top: 1rem;
        }
        
        .solution-box strong {
          display: block;
          margin-bottom: 0.75rem;
          color: #8b5cf6;
          text-transform: uppercase;
          font-size: 0.875rem;
          letter-spacing: 0.1em;
        }
        
        .solution-code {
          background: #0f172a;
          padding: 1rem;
          border-radius: 8px;
          color: #e0e7ff;
          font-family: 'JetBrains Mono', monospace;
          overflow-x: auto;
        }
        
        @media (max-width: 768px) {
          .hero-title {
            font-size: 2.5rem;
          }
          
          .difficulty-cards {
            grid-template-columns: 1fr;
          }
          
          .actions {
            flex-direction: column;
          }
          
          .btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>

      {!difficulty ? (
        <DifficultySelector />
      ) : showProblemList ? (
        <ProblemList />
      ) : (
        <div className="problem-view">
          <div className="stats-bar">
            <button className="btn btn-secondary" onClick={() => setShowProblemList(true)}>
              ← Problem List
            </button>
            <div className="stat">
              <span className="stat-label">Solved:</span>
              <span className="stat-value">{stats.solved}/{stats.attempted}</span>
            </div>
            <div className={`difficulty-badge ${difficulty}`}>
              {difficulty}
            </div>
            <button className="btn btn-secondary" onClick={() => setDifficulty(null)}>
              Change Difficulty
            </button>
          </div>

          {currentProblem && (
            <>
              <div className="problem-card">
                <h2>{currentProblem.title}</h2>
                {currentProblem.context && currentProblem.context.tables && (
                  <div className="schema-section">
                    {currentProblem.context.tables.map((table, idx) => (
                      <div key={idx} className="schema-table">
                        <div className="table-name">{table.name}</div>
                        <div className="table-columns">
                          {table.columns.map((col, colIdx) => (
                            <span key={colIdx} className="column-tag">{col}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="problem-description">
                  <p>{currentProblem.description}</p>
                </div>
              </div>

              {feedback && (
                <div className={`feedback ${feedback}`}>
                  {feedback === 'correct' ? (
                    <>
                      <CheckCircle size={24} />
                      <span>Perfect! Loading next challenge...</span>
                    </>
                  ) : (
                    <>
                      <XCircle size={24} />
                      <span>Not quite right. Try again or check the hint!</span>
                    </>
                  )}
                </div>
              )}

              <div className="editor-section">
                <label className="editor-label">Your SQL Query</label>
                <textarea
                  className="sql-editor"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="SELECT * FROM ..."
                  spellCheck={false}
                />
              </div>

              <div className="actions">
                <button className="btn btn-primary" onClick={checkAnswer}>
                  <CheckCircle size={20} />
                  Submit Answer
                </button>
                <button className="btn btn-secondary" onClick={() => setShowHint(!showHint)}>
                  <Zap size={20} />
                  {showHint ? 'Hide Hint' : 'Show Hint'}
                </button>
                <button className="btn btn-secondary" onClick={() => setShowSolution(!showSolution)}>
                  <Code size={20} />
                  {showSolution ? 'Hide Solution' : 'Show Solution'}
                </button>
                <button className="btn btn-secondary" onClick={() => generateNewProblem()}>
                  <RefreshCw size={20} />
                  New Problem
                </button>
              </div>

              {showHint && (
                <div className="hint-box">
                  <strong>💡 Hint</strong>
                  {currentProblem.hint}
                </div>
              )}

              {showSolution && (
                <div className="solution-box">
                  <strong>✨ Solution</strong>
                  <div className="solution-code">
                    {currentProblem.solution}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SQLPracticeGame;