interface CardProps {
  id: string;
}

export function Card({ id }: CardProps) {
  return (
    <div className="card-content">
      <p>Discord ID: {id}</p>
      <p>Estado: Desconectado</p>
    </div>
  );
}