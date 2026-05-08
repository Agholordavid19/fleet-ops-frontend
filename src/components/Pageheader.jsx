export default function PageHeader({ title, subtitle, action }) {
    return (
        <div className="flex items-start justify-between mb-8">
            <div>
                <h1 className="text-[22px] font-bold text-gray-100 tracking-tight leading-tight">
                    {title}
                </h1>
                {subtitle && (
                    <p className="text-[13px] text-gray-500 mt-1.5 leading-snug">
                        {subtitle}
                    </p>
                )}
            </div>
            {action && <div className="ml-4 shrink-0">{action}</div>}
        </div>
    )
}