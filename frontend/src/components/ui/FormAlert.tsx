import { Icon } from './Icon'

export function FormAlert({ message }: { message: string }) {
  return (
    <div className="mb-[18px] flex items-center gap-2.5 rounded-xl bg-expense-bg px-3.5 py-3 text-[13.5px] font-semibold text-expense">
      <Icon name="alert" size={16} />
      <span>{message}</span>
    </div>
  )
}
