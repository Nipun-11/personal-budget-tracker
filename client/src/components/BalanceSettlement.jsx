import React, { useMemo } from 'react';

export default function BalanceSettlement({ group }) {
  const settlements = useMemo(() => {
    if (!group.expenses || group.expenses.length === 0) return { balances: {}, settlements: [] };
    
    // Calculate net balances
    const balances = {};
    group.members.forEach(member => {
      balances[member] = 0;
    });
    
    group.expenses.forEach(expense => {
      balances[expense.paidBy] += expense.amount;
      expense.splitDetails.forEach(split => {
        balances[split.member] -= split.amount;
      });
    });
    
    // Calculate settlements
    const debtors = [];
    const creditors = [];
    
    Object.entries(balances).forEach(([member, balance]) => {
      if (balance > 0.01) {
        creditors.push({ member, amount: balance });
      } else if (balance < -0.01) {
        debtors.push({ member, amount: Math.abs(balance) });
      }
    });
    
    const settlements = [];
    let debtorIndex = 0;
    let creditorIndex = 0;
    
    while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
      const debtor = debtors[debtorIndex];
      const creditor = creditors[creditorIndex];
      const settlementAmount = Math.min(debtor.amount, creditor.amount);
      
      settlements.push({
        from: debtor.member,
        to: creditor.member,
        amount: settlementAmount
      });
      
      debtor.amount -= settlementAmount;
      creditor.amount -= settlementAmount;
      
      if (debtor.amount < 0.01) debtorIndex++;
      if (creditor.amount < 0.01) creditorIndex++;
    }
    
    return { balances, settlements };
  }, [group.expenses, group.members]);

  return (
    <div style={{ marginTop: '20px' }}>
      <h3>💳 Balance Settlement</h3>
      
      <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
        <h4>👥 Balances:</h4>
        {Object.entries(settlements.balances).map(([member, balance]) => (
          <div key={member} style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            padding: '5px 0',
            borderBottom: '1px solid #eee'
          }}>
            <span>{member}</span>
            <span style={{ 
              color: balance > 0 ? '#4caf50' : balance < 0 ? '#f44336' : '#666',
              fontWeight: 'bold'
            }}>
              ₹{balance.toFixed(2)}
              {balance > 0 && ' (gets back)'}
              {balance < 0 && ' (owes)'}
              {Math.abs(balance) < 0.01 && ' (settled)'}
            </span>
          </div>
        ))}
      </div>
      
      {settlements.settlements.length > 0 ? (
        <div style={{ backgroundColor: '#e8f5e8', padding: '15px', borderRadius: '8px' }}>
          <h4>🔄 Who Should Pay Whom:</h4>
          {settlements.settlements.map((settlement, index) => (
            <div key={index} style={{ 
              padding: '10px',
              backgroundColor: 'white',
              borderRadius: '6px',
              marginBottom: '8px',
              border: '1px solid #c8e6c9'
            }}>
              <strong>{settlement.from}</strong> → <strong>{settlement.to}</strong>: 
              <span style={{ color: '#2e7d32', fontWeight: 'bold', marginLeft: '10px' }}>
                ₹{settlement.amount.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ backgroundColor: '#e8f5e8', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
          <h4>✅ All Settled!</h4>
          <p>No settlements needed! 🎉</p>
        </div>
      )}
    </div>
  );
}
