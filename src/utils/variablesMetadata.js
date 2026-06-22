export const variablesMetadata = {
  'riesgo-pais': {
    title: "Riesgo País Argentina Hoy: Evolución y Valor Histórico — Infopeso",
    description: "Consulta el valor actual y la evolución histórica del Riesgo País de Argentina (EMBI+ de JP Morgan). Gráfico interactivo y análisis económico en tiempo real.",
    definition: "El Riesgo País de Argentina es medido a través del índice EMBI+ (Emerging Markets Bond Index Plus), el cual es elaborado diariamente por el banco de inversión estadounidense JP Morgan. Este indicador calcula la diferencia o brecha de tasas de interés que pagan los bonos soberanos emitidos por la República Argentina en comparación con los bonos del Tesoro de los Estados Unidos (considerados el estándar libre de riesgo en las finanzas globales).",
    importance: "Un Riesgo País elevado indica una mayor desconfianza de los mercados internacionales sobre la solvencia fiscal de la República Argentina y su capacidad para cumplir con los compromisos de deuda externa. Este índice encarece directamente el costo del financiamiento para el Estado nacional y para las empresas privadas locales, lo que restringe el crédito corporativo, reduce la inversión en infraestructura y presiona el mercado de cambios.",
    faqs: [
      {
        question: "¿Qué entidad calcula el Riesgo País de Argentina y cómo se expresa?",
        answer: "El indicador de Riesgo País es calculado oficialmente por el banco de inversión JP Morgan y se expresa en puntos básicos (pb). Cada 100 puntos básicos representan un 1% de sobretasa de interés anual por encima del rendimiento de los bonos del Tesoro de los Estados Unidos."
      },
      {
        question: "¿Qué factores determinan que el Riesgo País suba o baje?",
        answer: "El Riesgo País suba cuando los inversores venden bonos argentinos (lo que hace caer su precio y subir su rendimiento) ante dudas sobre el rumbo económico, déficit fiscal o capacidad de pago. Por el contrario, baja cuando aumenta la confianza en las cuentas públicas y la solvencia del país, reduciendo el interés requerido por el mercado."
      }
    ],
    dataset: {
      name: "Riesgo País de Argentina - Serie Histórica",
      description: "Evolución histórica diaria del Riesgo País argentino medido en puntos básicos por el banco JP Morgan (EMBI+).",
      variableMeasured: "Riesgo País (puntos básicos)",
      distributionUrl: "https://api.argentinadatos.com/v1/finanzas/indices/riesgo-pais"
    }
  },
  '27': {
    title: "Inflación Mensual en Argentina INDEC Hoy — Infopeso",
    description: "Consulta los últimos datos de inflación en Argentina (IPC) publicados oficialmente por el INDEC. Gráfico con serie histórica y evolución mensual de precios.",
    definition: "La inflación es el aumento generalizado y sostenido de los precios de los bienes y servicios en una economía durante un período de tiempo, lo que reduce el valor adquisitivo de la moneda local. En la República Argentina, la inflación oficial es calculada mensualmente por el Instituto Nacional de Estadística y Censos (INDEC) a través del Índice de Precios al Consumidor (IPC).",
    importance: "La inflación en pesos erosiona el poder de compra de los salarios, jubilaciones y ahorros de la población argentina. Monitorear su tasa mensual es fundamental para las paritarias laborales, la indexación de contratos de alquiler y deudas, y para comprender las decisiones de política monetaria del Banco Central de la República Argentina (BCRA), tales como el ajuste de las tasas de interés de referencia.",
    faqs: [
      {
        question: "¿Qué mide el Índice de Precios al Consumidor (IPC) del INDEC?",
        answer: "El IPC mide la variación promedio de los precios de una canasta de bienes y servicios representativa del consumo de los hogares en diversas regiones de Argentina, agrupados en 12 divisiones de consumo masivo."
      },
      {
        question: "¿Cómo afecta la inflación medida por el INDEC a las tasas de interés?",
        answer: "El Banco Central de la República Argentina (BCRA) suele ajustar sus tasas de interés de referencia en base a las expectativas de inflación. Si la inflación mensual sube, el BCRA tiende a mantener tasas reales positivas en pesos para incentivar el ahorro en plazos fijos y desalentar la presión de compra sobre el dólar."
      }
    ],
    dataset: {
      name: "Inflación Mensual de Argentina (IPC INDEC)",
      description: "Serie histórica oficial del Índice de Precios al Consumidor (IPC) mensual provisto por el INDEC.",
      variableMeasured: "Tasa de Inflación Mensual (porcentaje)",
      distributionUrl: "https://api.bcra.gob.ar/estadisticas/v4.0/Monetarias"
    }
  },
  '1': {
    title: "Reservas Internacionales del BCRA Hoy — Infopeso",
    description: "Valor actualizado de las Reservas Internacionales en dólares del Banco Central de la República Argentina (BCRA). Gráfico de evolución diaria.",
    definition: "Las Reservas Internacionales de la República Argentina son el conjunto de activos financieros en moneda extranjera (dólares estadounidenses, oro, yuanes de swaps bilaterales y Derechos Especiales de Giro del FMI) que posee y administra el Banco Central de la República Argentina (BCRA) para respaldar la moneda nacional y garantizar la liquidez externa del país.",
    importance: "El nivel de reservas del BCRA es un termómetro clave de la solvencia cambiaria de Argentina. Reservas robustas permiten al Banco Central amortiguar corridas cambiarias, intervenir en los mercados financieros, respaldar las importaciones necesarias para la producción industrial local y cumplir en tiempo y forma con los pagos de capital e intereses de la deuda externa soberana.",
    faqs: [
      {
        question: "¿Qué son las reservas brutas y las reservas netas del BCRA?",
        answer: "Las reservas brutas son la totalidad de activos de reserva declarados por el BCRA (incluyendo encajes de depósitos privados en dólares y préstamos como el swap de China). Las reservas netas representan los recursos líquidos y propios utilizables de forma inmediata por el Banco Central, descontando pasivos de corto plazo y depósitos comerciales."
      },
      {
        question: "¿Por qué es importante monitorear la variación de reservas internacionales del BCRA?",
        answer: "Un descenso de las reservas internacionales del BCRA debilita la capacidad del Banco Central para sostener el tipo de cambio oficial, incrementando las expectativas de una devaluación del peso y reduciendo la confianza de los acreedores internacionales."
      }
    ],
    dataset: {
      name: "Reservas Internacionales del BCRA",
      description: "Serie histórica diaria del total de Reservas Internacionales brutas en poder del Banco Central de la República Argentina, expresadas en millones de dólares.",
      variableMeasured: "Reservas Internacionales (Millones de USD)",
      distributionUrl: "https://api.bcra.gob.ar/estadisticas/v4.0/Monetarias"
    }
  },
  '15': {
    title: "Base Monetaria del BCRA: Evolución y Monto Hoy — Infopeso",
    description: "Consulta el monto actual y evolución de la Base Monetaria en pesos de Argentina. Gráfico de emisión monetaria y agregados económicos del BCRA.",
    definition: "La Base Monetaria (BM) representa la cantidad total de dinero de curso legal emitida directamente por el Banco Central de la República Argentina (BCRA). Se define técnicamente como la suma del dinero en circulación (billetes y monedas en manos del público y en las cajas de los bancos comerciales) y los depósitos en cuenta corriente de las entidades financieras constituidos en el BCRA.",
    importance: "El tamaño y ritmo de crecimiento de la base monetaria son indicadores centrales de la política de emisión y de las presiones inflacionarias potenciales. Una expansión de la base monetaria sin respaldo en la demanda de dinero real suele traducirse en una depreciación del peso argentino y en un alza en el nivel general de precios al consumidor.",
    faqs: [
      {
        question: "¿Cuáles son los principales factores que expanden o contraen la Base Monetaria en Argentina?",
        answer: "La base monetaria se expande principalmente por la asistencia financiera del BCRA al Tesoro Nacional (emisión para cubrir déficit), la compra neta de divisas en el mercado cambiario o el pago de intereses de pasivos remunerados. Se contrae mediante la venta de divisas o la absorción de pesos a través de instrumentos de deuda del Banco Central."
      },
      {
        question: "¿Cómo se relaciona la base monetaria del BCRA con la inflación?",
        answer: "Según la teoría monetaria y la evidencia histórica argentina, si el BCRA incrementa la base monetaria de forma sistemática por encima del crecimiento real de la producción, el exceso de pesos en circulación presiona sobre los precios de los bienes y servicios, alimentando la inflación."
      }
    ],
    dataset: {
      name: "Base Monetaria de la República Argentina",
      description: "Serie histórica diaria de la Base Monetaria argentina, expresada en millones de pesos.",
      variableMeasured: "Base Monetaria (Millones de ARS)",
      distributionUrl: "https://api.bcra.gob.ar/estadisticas/v4.0/Monetarias"
    }
  },
  '160': {
    title: "Tasa de Política Monetaria BCRA Hoy — Infopeso",
    description: "Consulta la tasa de interés de referencia del Banco Central (BCRA) en Argentina. Gráfico de evolución de tasas y rendimiento de política monetaria.",
    definition: "La Tasa de Política Monetaria es la tasa de interés de referencia fijada por el Directorio del Banco Central de la República Argentina (BCRA) para regular las condiciones de liquidez de la economía. Es el interés que el BCRA paga o cobra a las entidades financieras por el uso de instrumentos de absorción o inyección de pesos (como pases pasivos).",
    importance: "Esta tasa determina directamente el costo del crédito y el rendimiento de los depósitos en pesos argentinos. El BCRA la utiliza de forma estratégica: elevar la tasa busca incentivar las colocaciones en pesos (plazos fijos) para contener la demanda de dólares y reducir la inflación; bajar la tasa busca reactivar el crédito y dinamizar la economía abaratando el costo financiero de empresas y familias.",
    faqs: [
      {
        question: "¿Cómo impacta la Tasa de Política Monetaria en los plazos fijos de los ahorristas?",
        answer: "Los bancos comerciales toman la tasa de política monetaria como referencia principal para establecer la tasa nominal anual (TNA) de interés que pagan a los clientes por plazos fijos minoristas en pesos. Un alza del BCRA suele provocar un incremento en la tasa de plazo fijo, y viceversa."
      },
      {
        question: "¿Qué son los pasivos remunerados del Banco Central y cómo se vinculan a la tasa de referencia?",
        answer: "Son los instrumentos financieros de deuda de corto plazo (como los pases pasivos) que el BCRA utiliza para absorber el excedente de pesos del sistema financiero. La tasa de política monetaria es el costo financiero que paga el BCRA por mantener inmovilizados esos fondos bancarios."
      }
    ],
    dataset: {
      name: "Tasa de Política Monetaria de Argentina",
      description: "Serie histórica de la tasa de interés de referencia determinada por el BCRA para la política monetaria nacional.",
      variableMeasured: "Tasa de Interés Nominal Anual (%)",
      distributionUrl: "https://api.bcra.gob.ar/estadisticas/v4.0/Monetarias"
    }
  },
  '6': {
    title: "Tasa de Política Monetaria BCRA Hoy — Infopeso",
    description: "Consulta la tasa de interés de referencia del Banco Central (BCRA) en Argentina. Gráfico de evolución de tasas y rendimiento de política monetaria.",
    definition: "La Tasa de Política Monetaria es la tasa de interés de referencia fijada por el Directorio del Banco Central de la República Argentina (BCRA) para de regular las condiciones de liquidez de la economía. Es el interés que el BCRA paga o cobra a las entidades financieras por el uso de instrumentos de absorción o inyección de pesos (como pases pasivos).",
    importance: "Esta tasa determina directamente el costo del crédito y el rendimiento de los depósitos en pesos argentinos. El BCRA la utiliza de forma estratégica: elevar la tasa busca incentivar las colocaciones en pesos (plazos fijos) para contener la demanda de dólares y reducir la inflación; bajar la tasa busca reactivar el crédito y dinamizar la economía abaratando el costo financiero de empresas y familias.",
    faqs: [
      {
        question: "¿Cómo impacta la Tasa de Política Monetaria en los plazos fijos de los ahorristas?",
        answer: "Los bancos comerciales toman la tasa de política monetaria como referencia principal para establecer la tasa nominal anual (TNA) de interés que pagan a los clientes por plazos fijos minoristas en pesos. Un alza del BCRA suele provocar un incremento en la tasa de plazo fijo, y viceversa."
      },
      {
        question: "¿Qué son los pasivos remunerados del Banco Central y cómo se vinculan a la tasa de referencia?",
        answer: "Son los instrumentos financieros de deuda de corto plazo (como los pases pasivos) que el BCRA utiliza para absorber el excedente de pesos del sistema financiero. La tasa de política monetaria es el costo financiero que paga el BCRA por mantener inmovilizados esos fondos bancarios."
      }
    ],
    dataset: {
      name: "Tasa de Política Monetaria de Argentina",
      description: "Serie histórica de la tasa de interés de referencia determinada por el BCRA para la política monetaria nacional.",
      variableMeasured: "Tasa de Interés Nominal Anual (%)",
      distributionUrl: "https://api.bcra.gob.ar/estadisticas/v4.0/Monetarias"
    }
  },
  '32': {
    title: "Coeficiente de Estabilización de Referencia (CER) Hoy — Infopeso",
    description: "Consulta el valor actual y evolución histórica del CER en Argentina. Gráfico diario e inflación acumulada de referencia.",
    definition: "El Coeficiente de Estabilización de Referencia (CER) es un indicador de indexación diaria calculado y publicado por el Banco Central de la República Argentina (BCRA). Este coeficiente refleja la evolución de la inflación minorista medida por el INDEC mediante el Índice de Precios al Consumidor (IPC), con un desfase temporal predeterminado.",
    importance: "El CER se utiliza para ajustar deudas, contratos y una amplia gama de instrumentos financieros (como los plazos fijos UVA y bonos de la deuda pública ajustables por inflación) para proteger el valor de compra del capital original frente al deterioro que produce la inflación persistente en Argentina.",
    faqs: [
      {
        question: "¿Cómo se actualiza diariamente el valor del coeficiente CER?",
        answer: "El BCRA aplica una fórmula matemática diaria para ajustar el CER a partir del dato del IPC del INDEC. Tras la publicación de la inflación mensual, el coeficiente sube proporcionalmente de forma progresiva a lo largo del mes subsiguiente."
      },
      {
        question: "¿Qué son los créditos UVA y cómo se relacionan con el CER?",
        answer: "Las Unidades de Valor Adquisitivo (UVA) se actualizan diariamente siguiendo la evolución del Coeficiente de Estabilización de Referencia (CER). Por lo tanto, el capital adeudado en los créditos hipotecarios o prendarios UVA se ajusta directamente según la tasa de inflación acumulada en Argentina."
      }
    ],
    dataset: {
      name: "Coeficiente de Estabilización de Referencia (CER)",
      description: "Serie histórica diaria del coeficiente CER provisto por el BCRA, utilizado para indexación financiera.",
      variableMeasured: "Valor del Coeficiente CER",
      distributionUrl: "https://api.bcra.gob.ar/estadisticas/v4.0/Monetarias"
    }
  }
};

export function getVariableMetadata(id) {
  return variablesMetadata[String(id)] || {
    title: "Variable Económica Argentina Hoy — Infopeso",
    description: "Datos históricos y cotización en tiempo real de variables del Banco Central de la República Argentina (BCRA).",
    definition: "Indicador macroeconómico y monetario oficial reportado por el Banco Central de la República Argentina (BCRA) o INDEC.",
    importance: "El seguimiento de esta variable es clave para evaluar la estabilidad monetaria, financiera y cambiaria en la economía de Argentina.",
    faqs: [],
    dataset: null
  };
}
