# Sobre la licencia (AGPL-3.0-or-later)

Este proyecto está licenciado bajo la GNU Affero General Public License v3.0 (o, a elección de
quien lo redistribuya, cualquier versión posterior). El texto completo está en
[`LICENSE`](../LICENSE), en la raíz del repo. Esta página explica qué significa eso en la
práctica y por qué se eligió, no reemplaza el texto legal.

## Por qué AGPL y no otra licencia

CEINFUA Website es software libre por decisión explícita del desarrollador, no un detalle
administrativo agregado al final. La AGPL en particular (en vez de MIT, Apache-2.0, o incluso la
GPL "normal") se eligió por una razón concreta:

Este proyecto es una aplicación web fullstack (Next.js con rutas de API) — el tipo de software
que normalmente se corre como servicio, no que se distribuye como binario o librería. La GPL
"normal" exige compartir el código fuente solo cuando el software se **distribuye**; correrlo
como servicio de red (alguien clona el repo, lo modifica, y lo despliega para que otros lo usen
por HTTP) no cuenta como "distribución" bajo la GPL. Eso es lo que se conoce como el "SaaS
loophole" (agujero de la nube): alguien podría tomar este código, modificarlo, ofrecerlo como
servicio a otro centro de estudiantes o institución, y nunca estar obligado a devolver esas
modificaciones a la comunidad.

La AGPL cierra ese agujero: si corrés una versión modificada de este software como servicio de
red accesible por otros usuarios, tenés que ofrecerles acceso al código fuente de tu versión
modificada (ver sección 13 de la licencia). Esto está alineado con el espíritu original del
proyecto: es software para un centro de estudiantes, pensado para que otros centros de
estudiantes o proyectos similares puedan reusarlo, adaptarlo, y beneficiarse de las mejoras que
se hagan en cualquier fork — no para que una copia modificada termine corriendo en algún lado sin
que el código nunca vuelva a ser público.

## Qué implica en la práctica

- **Podés:** usar, estudiar, modificar y redistribuir este código libremente, incluso con fines
  comerciales.
- **Si distribuís una versión modificada, o la corrés como servicio de red que otros usan:**
  tenés que ofrecer el código fuente de esa versión (modificada o no) bajo la misma licencia.
- **No podés:** tomar este código, modificarlo, y distribuir esa versión (o correrla como
  servicio) bajo una licencia más restrictiva, ni quitarle la atribución/licencia.

Si en algún momento este proyecto se despliega en un dominio real y accesible públicamente, hay
que agregar un link visible ("Código fuente" o similar) que lleve al repositorio, para cumplir
con la sección 13 de la AGPL. Al día de escribir esto, el proyecto solo corre localmente, así que
ese requisito todavía no aplica — pero queda anotado acá para no olvidarlo al desplegar.

## No es solo un archivo LICENSE

Elegir AGPL no fue "agregar un LICENSE porque hay que tener uno". Es una decisión intencional
sobre cómo se espera que este código se use y se comparta si termina corriendo en otro lado.
Cualquier cambio de licencia en el futuro (por ejemplo, relicenciar a algo más permisivo) debería
ser una decisión consciente y documentada acá, no un cambio incidental.
