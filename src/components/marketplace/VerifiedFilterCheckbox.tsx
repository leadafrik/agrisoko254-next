"use client";

export default function VerifiedFilterCheckbox({ defaultChecked }: { defaultChecked: boolean }) {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const form = event.currentTarget.form;
    if (form) form.requestSubmit();
  };

  return (
    <label className="flex cursor-pointer items-center gap-2 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-medium text-stone-700 transition hover:border-terra-300 hover:bg-terra-50 hover:text-terra-700">
      <input
        type="checkbox"
        name="verified"
        value="1"
        defaultChecked={defaultChecked}
        onChange={handleChange}
        className="h-4 w-4 accent-terra-500"
      />
      Verified only
    </label>
  );
}
