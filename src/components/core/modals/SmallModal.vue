<template>
	<Transition>
		<div
			v-if="isToggled"
			class="bg-black rounded-lg shadow w-full md:pt-0 pt-5 z-50 md:bg-slate-1100 absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
			:class="{
				'max-w-xs': modalSize === ModalSize.SuperSmall,
				'max-w-sm': modalSize === ModalSize.ExtraSmall,
				'max-w-md': modalSize === ModalSize.Small,
				'max-w-lg': modalSize === ModalSize.Medium,
				'max-w-4xl': modalSize === ModalSize.Large,
				'max-w-7xl': modalSize === ModalSize.ExtraLarge
			}"
		>
			<div class="flex p-2 border-b border-gray-600 rounded-t justify-between">
				<div></div>

				<h3 class="font-sans text-md font-semibold text-gray-300">
					{{ title }}
				</h3>

				<button
					class="text-gray-400 bg-transparent sm:hover:bg-gray-200 sm:hover:text-gray-900 rounded-lg text-sm p-1 inline-flex items-center dark:sm:hover:bg-gray-600 dark:sm:hover:text-white"
					@click="onModalClosed()"
				>
					<SVGLoader :icon="'cross'" />
				</button>
			</div>

			<div class="space-y-6">
				<div class="flex flex-col space-y-5 max-h-96 overflow-y-scroll scrollbar">
					<!-- FOLLOW -->
					<div v-if="modalType === ModalName.FOLLOW">
						<div
							v-for="item in items"
							:key="item.userName"
							class="rounded-lg flex justify-between space-x-2 py-2 px-4"
							@click.stop="goToUserProfile(item.userName)"
						>
							<FollowCard
								:show-button="true"
								:profile-image="item.profilePictureUrl"
								@onActionClick="handleActionClick(item)"
							>
								<template #user-name>
									{{ item.userName }}
								</template>

								<template #button-name>
									Remove
								</template>
							</FollowCard>
						</div>
					</div>

					<!-- COMMENTS -->
					<div
						v-else-if="modalType === ModalName.COMMENT"
						class="p-5"
					>
						<div
							v-if="shouldDisplayNoComments"
							class="flex flex-col place-self-center space-y-2"
						>
							<span class="font-sans text-2xl text-white font-bold mx-auto">
								No comments yet.
							</span>
						</div>

						<CommentCard
							v-for="item in items"
							v-else
							:key="item.id || item.userName"
							:comment="item"
						/>
					</div>

					<!-- GENDER -->
					<div
						v-else-if="modalType === ModalName.GENDER"
						class="flex flex-col p-5"
					>
						<div
							v-for="item in items"
							:key="item.name"
							class="flex items-center mb-4 mx-2"
						>
							<input
								:checked="activeGender === item.name"
								type="radio"
								:value="item.name"
								class="w-4 h-4 text-gray-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
								@click="onGenderSelected(item.name)"
							/>

							<label
								class="ml-2 text-sm font-sans font-semibold text-gray-200 capitalize"
							>
								{{ item.name }}
							</label>
						</div>

						<TheButton
							:size="'md'"
							@click="onModalClosed()"
						>
							<span class="sm:text-md sm:font-semibold">
								Done
							</span>
						</TheButton>
					</div>
				</div>
			</div>
		</div>
	</Transition>
</template>


<script setup lang="ts">
import {
    ref,
    computed,
    watch,
    type PropType
} from 'vue'

import {
    SmallCard as FollowCard,
    SVGLoader,
    CommentCard,
    TheButton,
} from '@/components'

import {
    ModalName,
    ModalSize,
    goToUserProfile
} from '@/common'

const props = defineProps({
    title: {
        type: String,
        required: true
    },

    items: {
        type: Array as PropType<any[]>,
        default: () => []
    },

    isToggled: {
        type: Boolean,
        required: true
    },

    modalSize: {
        type: String,
        default: ModalSize.Large
    },

    modalType: {
        type: String,
        default: ModalName.FOLLOW
    }
})

const emit = defineEmits([
    'onModalClosed',
    'onGenderSelected',
    'onActionClick'
])

const activeGender = ref('')

// watch props.items for potential side-effects if needed in future

const handleActionClick = (item: any) => {
    emit('onActionClick', item)
}

const shouldDisplayNoComments = computed(() => {
    return !props.items || props.items.length === 0
})

const onGenderSelected = (gender: string) => {
    activeGender.value = gender
    emit('onGenderSelected', gender)
}

const onModalClosed = () => {
    emit('onModalClosed')
}
</script>

