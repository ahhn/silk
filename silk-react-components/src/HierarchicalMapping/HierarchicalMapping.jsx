import React from 'react';
import UseMessageBus from './UseMessageBusMixin';
import hierarchicalMappingChannel from './store';
import TreeView from './Components/TreeView';
import {ConfirmationDialog, AffirmativeButton, DismissiveButton, DisruptiveButton,Button, ContextMenu, MenuItem} from 'ecc-gui-elements';
import MappingRuleOverview from './Components/MappingRuleOverview'

// Do not care about it yet
/*const props = {
 apiBase: 'http://foo/bar',
 project: 'example',
 transformationTask: '',
 };*/

const HierarchicalMapping = React.createClass({

    mixins: [UseMessageBus],

    // define property types
    /*propTypes: {
     apiBase: React.PropTypes.string.isRequired, // used restApi url
     project: React.PropTypes.string.isRequired, // used project name
     transformationTask: React.PropTypes.string, // used transformation
     },*/

    // initilize state
    getInitialState() {
        // listen to rule id changes
        this.subscribe(hierarchicalMappingChannel.subject('ruleId.change'), this.onRuleNavigation);
        this.subscribe(hierarchicalMappingChannel.subject('removeClick'), this.handleClickRemove);
        // listen to rule create event
        this.subscribe(hierarchicalMappingChannel.subject('ruleId.create'), this.onRuleCreate);

        return {
            // currently selected rule id
            currentRuleId: 'root',
            // show / hide navigation
            showNavigation: true,
            // which edit view are we viewing
            ruleEditView: false,
            elementToDelete: false,
        };
    },
    handleClickRemove({id, type}) {
        this.setState({
            elementToDelete: {id, type},
        });
    },
    handleConfirmRemove(event) {
        event.stopPropagation();
        hierarchicalMappingChannel.request({topic: 'rule.removeRule', data: {id: this.state.elementToDelete.id}})
            .subscribe(
                () => {
                    // FIXME: let know the user which element is gone!
                    this.setState({
                        elementToDelete: false,
                    });
                },
                (err) => {
                    // FIXME: let know the user what have happened!
                    this.setState({
                        elementToDelete: false,
                    });
                }
            );
    },
    handleCancelRemove() {
        this.setState({
            elementToDelete: false,
        });
    },
    // react to rule id changes
    onRuleNavigation({newRuleId}) {
        this.setState({
            currentRuleId: newRuleId,
        })
    },
    // show / hide navigation
    handleToggleNavigation() {
        this.setState({
            showNavigation: !this.state.showNavigation,
        });
    },
    onRuleCreate({type}) {
        this.setState({
            ruleEditView: {
                type,
            },
        });
    },
    handleRuleEditClose() {
        this.setState({
            ruleEditView: false,
        });
    },
    // template rendering
    render () {

        const treeView = (
            this.state.showNavigation ? (
                <TreeView
                    apiBase={this.props.apiBase}
                    project={this.props.project}
                    transformationTask={this.props.transformationTask}
                    currentRuleId={this.state.currentRuleId}
                />
            ) : false
        );
        // render mapping edit / create view of value and object
        const createRuleForm = this.state.ruleEditView ? (
            <div className="ecc-silk-mapping__createrule">
                {
                    this.state.ruleEditView.type === 'object' ? (
                        <ObjectMappingRuleForm
                            {...this.state.ruleEditView}
                            onClose={this.handleRuleEditClose}
                            parentId={this.state.currentRuleId}
                            edit={true}
                        />
                    ) : (
                        <ValueMappingRuleForm
                            {...this.state.ruleEditView}
                            onClose={this.handleRuleEditClose}
                            parentId={this.state.currentRuleId}
                            edit={true}
                        />
                    )
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
                Are you sure you want to delete the rule with id '{this.state.elementToDelete.id}' and type '{this.state.elementToDelete.type}'?
            </ConfirmationDialog>
            : false;


        const debugOptions = __DEBUG__
            ? (<div>
                <DisruptiveButton
                    onClick={() => {
                        localStorage.setItem('mockStore', null);
                        location.reload();
                    }}
                >RESET</DisruptiveButton>
                <Button
                    onClick = {() => {
                        hierarchicalMappingChannel.subject('reload').onNext(true);
                    }}
                >RELOAD</Button></div>) : false;

        return (
            <div
                className="ecc-silk-mapping"
            >
                <div className="mdl-card mdl-shadow--2dp mdl-card--stretch">
                    <div className="ecc-silk-mapping__header mdl-card__title">
                        {debugOptions}
                        {deleteView}
                        <ContextMenu
                            iconName="tune"
                        >
                            <MenuItem
                                onClick={this.handleToggleNavigation}
                            >
                                {this.state.showNavigation ? 'Hide tree navigation' : 'Show tree navigation'}
                            </MenuItem>
                        </ContextMenu>
                    </div>
                    <div className="ecc-silk-mapping__content">
                        {treeView}
                        {
                            <MappingRuleOverview
                                apiBase={this.props.apiBase}
                                project={this.props.project}
                                transformationTask={this.props.transformationTask}
                                currentRuleId={this.state.currentRuleId}
                                createRuleForm={createRuleForm}
                            />
                        }
                    </div>
                </div>
            </div>
        );
    },
});

export default HierarchicalMapping;
