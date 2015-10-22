/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package de.fuberlin.wiwiss.silk.rule

import de.fuberlin.wiwiss.silk.config.Prefixes
import de.fuberlin.wiwiss.silk.entity.{Entity, Index}
import de.fuberlin.wiwiss.silk.rule.similarity.SimilarityOperator
import de.fuberlin.wiwiss.silk.runtime.resource.ResourceLoader
import de.fuberlin.wiwiss.silk.runtime.serialization.{Serialization, XmlFormat}
import de.fuberlin.wiwiss.silk.util.{DPair, Uri}

import scala.xml.Node

/**
 * A linkage rule specifies the conditions which must hold true so that a link is generated between two entities.
 */
case class LinkageRule(operator: Option[SimilarityOperator] = None,
                       filter: LinkFilter = LinkFilter(),
                       linkType: Uri = Uri.fromURI("http://www.w3.org/2002/07/owl#sameAs")) {
  /**
   * Computes the similarity between two entities.
   *
   * @param entities The entities to be compared.
   * @param limit If the confidence is below this limit, it will be capped to -1.0.
   *
   * @return The confidence as a value between -1.0 and 1.0.
   *         -1.0 for definitive non-matches.
   *         +1.0 for definitive matches.
   */
  def apply(entities: DPair[Entity], limit: Double = 0.0): Double = {
    operator match {
      case Some(op) => op(entities, limit).getOrElse(-1.0)
      case None => -1.0
    }
  }

  /**
   * Indexes an entity.
   *
   * @param entity The entity to be indexed
   * @param limit The confidence limit
   *
   * @return A set of (multidimensional) indexes. Entities within the threshold will always get the same index.
   */
  def index(entity: Entity, limit: Double = 0.0): Index = {
    operator match {
      case Some(op) => op.index(entity, limit)
      case None => Index.empty
    }
  }
}

/**
 * Creates new linkage rules.
 */
object LinkageRule {
  /**
   * Creates a new linkage rule with one root operator.
   */
  def apply(operator: SimilarityOperator): LinkageRule = LinkageRule(Some(operator))

  /**
   * XML serialization format.
   */
  implicit object LinkageRuleFormat extends XmlFormat[LinkageRule] {

    import Serialization._

    def read(node: Node)(implicit prefixes: Prefixes, resourceLoader: ResourceLoader): LinkageRule = {
      val link = (node \ "@linkType").text.trim
      LinkageRule(
        operator = (node \ "_").find(_.label != "Filter").map(fromXml[SimilarityOperator]),
        filter = (node \ "Filter").headOption.map(LinkFilter.fromXML).getOrElse(LinkFilter()),
        linkType = if(link.isEmpty) "http://www.w3.org/2002/07/owl#sameAs" else prefixes.resolve(link)
      )
    }

    def write(value: LinkageRule)(implicit prefixes: Prefixes): Node = {
      <LinkageRule linkType={value.linkType.serialize}>
        {value.operator.toList.map(toXml[SimilarityOperator])}
        {value.filter.toXML}
      </LinkageRule>
    }
  }
}