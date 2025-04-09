import { useEffect } from "react";

export default function ExpenseWithdrawalStrategy({
  dummyInvestmentNames,
  withdrawalStrategy,
  setWithdrawalStrategy,
}) {
  useEffect(() => {
    if (withdrawalStrategy.length === 0 && dummyInvestmentNames.length > 0) {
      setWithdrawalStrategy(dummyInvestmentNames);
    }
  }, [dummyInvestmentNames, withdrawalStrategy, setWithdrawalStrategy]);

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDrop = (e, index) => {
    const fromIndex = Number(e.dataTransfer.getData("text/plain"));
    const newOrder = [...withdrawalStrategy];
    const [movedItem] = newOrder.splice(fromIndex, 1);
    newOrder.splice(index, 0, movedItem);
    setWithdrawalStrategy(newOrder);
  };

  return (
    <div className="w-full border border-gray-300 rounded-md p-6 mt-8 bg-gray-50">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Expense Withdrawal Strategy</h2>

      {dummyInvestmentNames.length === 0 ? (
        <p className="text-gray-500 italic">No investments available.</p>
      ) : (
        <div className="space-y-2">
          <ul className="space-y-2">
            {withdrawalStrategy.map((invName, index) => (
              <li
                key={invName}
                className="flex items-center gap-3 p-2 bg-white border rounded shadow-sm cursor-grab"
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, index)}
              >
                <span className="text-sm font-medium w-6">{index + 1}.</span>
                <div className="flex-1">{invName}</div>
                <span className="text-gray-400">⋮⋮</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
