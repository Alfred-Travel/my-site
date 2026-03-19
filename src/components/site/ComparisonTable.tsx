type ComparisonRow = {
  feature: string;
  alfred: string;
  wonderplan: string;
  tripadvisor: string;
};

type ComparisonTableProps = {
  rows: ComparisonRow[];
};

export function ComparisonTable({ rows }: ComparisonTableProps) {
  return (
    <div className="comparison-table-wrapper">
      <table className="comparison-table">
        <thead>
          <tr>
            <th scope="col">Feature</th>
            <th scope="col">Alfred</th>
            <th scope="col">Wonderplan</th>
            <th scope="col">Tripadvisor</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.feature}>
              <th scope="row">{row.feature}</th>
              <td>{row.alfred}</td>
              <td>{row.wonderplan}</td>
              <td>{row.tripadvisor}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
