
import React from 'react';

export default function TransactionTableList({ transactions }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ backgroundColor: '#f0f0f0' }}>
          <th style={{ padding: '8px', border: '1px solid #ddd' }}>Date</th>
          <th style={{ padding: '8px', border: '1px solid #ddd' }}>Category</th>
          <th style={{ padding: '8px', border: '1px solid #ddd' }}>Amount</th>
          <th style={{ padding: '8px', border: '1px solid #ddd' }}>Type</th>
          <th style={{ padding: '8px', border: '1px solid #ddd' }}>Note</th>
        </tr>
      </thead>
      <tbody>
        {transactions.map((tx) => (
          <tr key={tx._id}>
            <td style={{ padding: '8px', border: '1px solid #ddd' }}>{tx.date}</td>
            <td style={{ padding: '8px', border: '1px solid #ddd' }}>{tx.category}</td>
            <td style={{ padding: '8px', border: '1px solid #ddd' }}>₹{tx.amount}</td>
            <td style={{ padding: '8px', border: '1px solid #ddd' }}>{tx.type}</td>
            <td style={{ padding: '8px', border: '1px solid #ddd' }}>{tx.note || '-'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
