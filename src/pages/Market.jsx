import BarsChart from "../charts/ChartBars";
import { ErrorComponent } from "../components/Error";
import { Loading } from "../components/LoadingAnim";

export default function Market(){
  return(
    <section className="pt-[100px] min-h-[100vh]">
      <BarsChart 
        labels={['01-01-2001', '02-02-2002']}
        dataset={[1, 2]}
        height={'130px'}
        color={'#ddd'}
      />
    </section>
  )
}