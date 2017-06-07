import React from 'react';
import UseMessageBus from '../../UseMessageBusMixin';
import {
    Button,
    ConfirmationDialog,
    AffirmativeButton,
    DismissiveButton,
    DisruptiveButton,
    Info,
} from 'ecc-gui-elements';
import hierarchicalMappingChannel from '../../store';
import _ from 'lodash';
import ValueMappingRuleForm from './Forms/ValueMappingRuleForm';
import {SourcePath} from './SharedComponents';

const RuleValueEditView = React.createClass({
    mixins: [UseMessageBus],

    // define property types
    // FIXME: check propTypes
    propTypes: {
        comment: React.PropTypes.string,
        id: React.PropTypes.string,
        //operator: React.PropTypes.object,
        type: React.PropTypes.string,
        // FIXME: sourcePath === source property?
        sourcePath: React.PropTypes.string,
        mappingTarget: React.PropTypes.object,
        onClose: React.PropTypes.func,
        edit: React.PropTypes.bool.isRequired,
    },

    getInitialState() {
        return {
            edit: this.props.edit,
        };
    },
    handleComplexEdit(event) {
        event.stopPropagation();
        alert('Normally this would open the complex editor (aka jsplumb view)')
    },
    // open view in edit mode
    handleEdit(event) {
        event.stopPropagation();
        hierarchicalMappingChannel.subject('ruleView.edit').onNext({id: this.props.id});
        this.setState({
            edit: !this.state.edit,
        })
    },
    handleClose(event) {
        event.stopPropagation();
        if (_.isFunction(this.props.onClose)) {
            this.props.onClose();
        } else {
            this.setState({
                edit: false,
            })
        }
        hierarchicalMappingChannel.subject('ruleView.closed').onNext({id: this.props.id});
    },
    // template rendering
    render () {
        const {edit} = this.state;

        if (edit) {
            return <ValueMappingRuleForm
                {
                    // Fixme: Remove once we load data directly in form
                    ...this.props
                }
                id={this.props.id}
                parentId={this.props.parentId}
                onClose={() => this.setState({edit: false}) }
            />
        }

        //TODO: Move delete view out of here!
        const deleteView = this.state.elementToDelete
            ? <ConfirmationDialog
                active={true}
                title="Delete Rule"
                confirmButton={
                    <DisruptiveButton disabled={false} onClick={this.handleConfirmRemove}>
                        Delete
                    </DisruptiveButton>
                }
                cancelButton={
                    <DismissiveButton onClick={this.handleCancelRemove}>
                        Cancel
                    </DismissiveButton>
                }>
                Are you sure you want to delete the rule with id '{this.state.elementToDelete}'?
            </ConfirmationDialog>
            : false;

        // FIXME: created and updated need to be formated. Creator is not available in Dataintegration :(

        return (
            (
                <div
                    className="ecc-silk-mapping__rulesviewer"
                >

                    <div className="mdl-card mdl-card--stretch">
                        <div
                            className="ecc-silk-mapping__rulesviewer__title mdl-card__title mdl-card--border clickable"
                            onClick={this.props.handleToggleExpand}
                        >
                            <div className="mdl-card__title-text">
                                Readable name of {_.get(this.props, 'mappingTarget.uri', undefined)}
                            </div>
                        </div>
                        <div className="mdl-card__content">
                            {
                                _.get(this.props, 'mappingTarget.uri', undefined) ? (
                                    <div
                                        className="ecc-silk-mapping__rulesviewer__targetProperty"
                                    >
                                        <dl className="ecc-silk-mapping__rulesviewer__attribute">
                                            <dt className="ecc-silk-mapping__rulesviewer__attribute-label">
                                                Target property
                                            </dt>
                                            <dd className="ecc-silk-mapping__rulesviewer__attribute-title">
                                                Label/Readable name of {_.get(this.props, 'mappingTarget.uri', undefined)} (TODO)
                                            </dd>
                                            <dd className="ecc-silk-mapping__rulesviewer__attribute-info">
                                                {_.get(this.props, 'mappingTarget.uri', undefined)}
                                            </dd>
                                            <dd className="ecc-silk-mapping__rulesviewer__attribute-info">
                                                <Info border>
                                                    Vocabulary description about {_.get(this.props, 'mappingTarget.uri', undefined)} (TODO)
                                                </Info>
                                            </dd>
                                        </dl>
                                    </div>
                                ) : false
                            }
                            {
                                _.get(this.props, 'mappingTarget.valueType.nodeType', undefined) ? (
                                    <div
                                        className="ecc-silk-mapping__rulesviewer__propertyType"
                                    >
                                        <dl className="ecc-silk-mapping__rulesviewer__attribute">
                                            <dt className="ecc-silk-mapping__rulesviewer__attribute-label">
                                                Property type
                                            </dt>
                                            <dd className="ecc-silk-mapping__rulesviewer__attribute-title">
                                                {_.get(this.props, 'mappingTarget.valueType.nodeType', undefined)}
                                            </dd>
                                            <dd className="ecc-silk-mapping__rulesviewer__attribute-info">
                                                Any other information available here? (TODO)
                                            </dd>
                                        </dl>
                                    </div>
                                ) : false
                            }
                            <div>
                                Source property
                                <SourcePath
                                    rule={
                                        {
                                            type: this.props.type,
                                            sourcePath: this.props.sourcePath,
                                        }
                                    }
                                />
                            </div>
                            {
                                this.props.comment ? (
                                    <div
                                        className="ecc-silk-mapping__rulesviewer__comment"
                                    >
                                        <dl className="ecc-silk-mapping__rulesviewer__attribute">
                                            <dt className="ecc-silk-mapping__rulesviewer__attribute-label">
                                                Comment
                                            </dt>
                                            <dd className="ecc-silk-mapping__rulesviewer__attribute-info">
                                                {this.props.comment}
                                            </dd>
                                        </dl>
                                    </div>
                                ) : false
                            }
                        </div>
                        <div className="ecc-silk-mapping__ruleseditor__actionrow mdl-card__actions mdl-card--border">
                            <Button
                                className="ecc-silk-mapping__ruleseditor__actionrow-edit"
                                onClick={this.handleEdit}
                            >
                                Edit rule
                            </Button>
                            <Button
                                className="ecc-silk-mapping__ruleseditor__actionrow-complex-edit"
                                onClick={this.handleComplexEdit}
                            >
                                Edit complex
                            </Button>
                            <DisruptiveButton
                                className="ecc-silk-mapping__ruleseditor__actionrow-remove"
                                onClick={()=>hierarchicalMappingChannel.subject('removeClick').onNext({id: this.props.id, type: this.props.type})}
                                disabled={false} // FIXME: all elements are removable?
                            >
                                Remove rule
                            </DisruptiveButton>
                        </div>
                    </div>
                </div>
            )
        );
    },

});

export default RuleValueEditView;
