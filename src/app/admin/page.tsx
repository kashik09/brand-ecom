export default function AdminHome() {
  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-bold">Admin</h1>
      <ul className="list-disc pl-5 text-sm">
        <li>
          <a className="underline" href="/admin/settings">
            Settings
          </a>{" "}
          — shipping zones
        </li>
        <li>
          <a className="underline" href="/admin/orders">
            Orders
          </a>{" "}
          — fulfill digitals
        </li>
      </ul>
      <p className="text-xs text-gray-500">
        Note: This MVP stores settings in your browser (localStorage) for now.
      </p>
    </section>
  );
}
