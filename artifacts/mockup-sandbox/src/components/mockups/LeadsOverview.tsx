export function LeadsOverview() {
  const leads = [
    { name: 'Maya Chen', username: '@mayachen.design', platform: 'Instagram', score: 88, status: 'QUALIFIED' },
    { name: 'Jordan Lee', username: '@jordanbuilds', platform: 'LinkedIn', score: 74, status: 'INTERESTED' },
    { name: 'Riley Morgan', username: '@rileymorgan', platform: 'Instagram', score: 51, status: 'ENGAGED' },
    { name: 'Sam Rivera', username: '@samrivera.co', platform: 'LinkedIn', score: 29, status: 'DISCOVERED' },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 p-8 dark:bg-slate-950">
      <h1 className="text-2xl font-bold tracking-tight">SocialSphere AI</h1>
      <p className="text-sm text-slate-500">Lead Engine · demo data</p>
      <div className="mt-6 grid max-w-3xl overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
          <thead className="bg-slate-100 dark:bg-slate-900">
            <tr>
              {['Lead', 'Platform', 'Score', 'Status'].map((heading) => (
                <th
                  key={heading}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {leads.map((lead) => (
              <tr key={lead.username}>
                <td className="px-4 py-3">
                  <p className="text-sm font-semibold">{lead.name}</p>
                  <p className="text-xs text-slate-500">{lead.username}</p>
                </td>
                <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{lead.platform}</td>
                <td className="px-4 py-3 text-sm font-medium text-indigo-600">{lead.score}</td>
                <td className="px-4 py-3 text-sm">
                  <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-600">
                    {lead.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default LeadsOverview;